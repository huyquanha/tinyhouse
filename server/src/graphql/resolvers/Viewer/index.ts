import { IResolvers } from 'apollo-server-express';
import { Viewer, Database, User } from '../../../lib/types';
import { Google } from '../../../lib/api';
import { LogInArgs } from './types';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { COOKIE_NAME } from '../../../lib/constants';

const cookieOptions = {
  httpOnly: true, // prevent XSS
  sameSite: true, // prevent CSRF
  signed: true, // creates an HMAC of the value and base64-encode it to avoid cookie being tampered
  secure: process.env.NODE_ENV === 'development' ? false : true, // HTTPS only, but not for development
};

const logInViaGoogle = async (
  code: string,
  token: string,
  db: Database,
  res: Response
): Promise<User | undefined> => {
  const { user } = await Google.logIn(code);

  if (!user) {
    throw new Error('Google login error');
  }
  // Names/Photos/Email Lists
  const userNamesList = user.names && user.names.length ? user.names : null;
  const userPhotosList = user.photos && user.photos.length ? user.photos : null;
  const userEmailsList =
    user.emailAddresses && user.emailAddresses.length
      ? user.emailAddresses
      : null;
  // User Display Name
  const userName = userNamesList?.[0].displayName ?? null;
  // User Id
  const userId = userNamesList?.[0]?.metadata?.source?.id ?? null;
  // User Avatar
  const userAvatar = userPhotosList?.[0].url ?? null;
  // User Email
  const userEmail = userEmailsList?.[0].value ?? null;
  if (!userId || !userName || !userAvatar || !userEmail) {
    throw new Error('Google login error');
  }
  const updateRes = await db.users.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: {
        name: userName,
        avatar: userAvatar,
        contact: userEmail,
        token,
      },
    },
    { returnOriginal: false }
  );
  let viewer = updateRes.value;
  // if the user doesn't exist yet, insert a new one
  if (!viewer) {
    const insertRes = await db.users.insertOne({
      _id: userId,
      token,
      name: userName,
      avatar: userAvatar,
      contact: userEmail,
      income: 0,
      bookings: [],
      listings: [],
    });
    viewer = insertRes.ops[0];
  }
  res.cookie(COOKIE_NAME, userId, {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  });
  return viewer;
};

const logInViaCookie = async (
  token: string,
  db: Database,
  req: Request,
  res: Response
): Promise<User | undefined> => {
  const updateRes = await db.users.findOneAndUpdate(
    {
      _id: req.signedCookies[COOKIE_NAME],
    },
    {
      $set: { token },
    },
    { returnOriginal: false }
  );
  const viewer = updateRes.value;
  if (!viewer) {
    res.clearCookie(COOKIE_NAME, cookieOptions);
  }
  return viewer;
};

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (): string => {
      try {
        return Google.authUrl;
      } catch (err) {
        throw new Error(`Failed to query Google Auth Url: ${err}`);
      }
    },
  },
  Mutation: {
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db, req, res }: { db: Database; req: Request; res: Response }
    ): Promise<Viewer> => {
      try {
        const code = input ? input.code : null;
        const token = crypto.randomBytes(16).toString('hex');
        const viewer = code
          ? await logInViaGoogle(code, token, db, res)
          : await logInViaCookie(token, db, req, res);
        if (!viewer) {
          return { didRequest: true };
        }
        return {
          _id: viewer._id,
          token: viewer.token,
          avatar: viewer.avatar,
          walletId: viewer.walletId,
          didRequest: true,
        };
      } catch (err) {
        throw new Error(`Failed to login: ${err}`);
      }
    },
    logOut: (
      _root: undefined,
      _args: Record<string, unknown>,
      { res }: { res: Response }
    ): Viewer => {
      try {
        // most browsers will only clear the cookie if the options are identical to when
        // the cookie is set (except expires or maxAge property)
        res.clearCookie(COOKIE_NAME, cookieOptions);
        return { didRequest: true };
      } catch (err) {
        throw new Error(`Failed to logout: ${err}`);
      }
    },
  },
  Viewer: {
    id: (viewer: Viewer): string | undefined => viewer._id,
    hasWallet: (viewer: Viewer): boolean | undefined =>
      viewer.walletId ? true : undefined,
  },
};
