import { IResolvers } from 'apollo-server-express';
import { Viewer, Database, User, UserInfo, Provider } from '../../../lib/types';
import { Facebook, Google } from '../../../lib/api';
import { AuthUrlArgs, LogInArgs } from './types';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { COOKIE_NAME } from '../../../lib/constants';

const cookieOptions = {
  httpOnly: true, // prevent XSS
  sameSite: true, // prevent CSRF
  signed: true, // creates an HMAC of the value and base64-encode it to avoid cookie being tampered
  secure: process.env.NODE_ENV === 'development' ? false : true, // HTTPS only, but not for development
};

const logInViaProvider = async (
  provider: Provider,
  code: string,
  token: string,
  db: Database,
  res: Response
): Promise<User | undefined> => {
  let userInfo: UserInfo | null = null;
  switch (provider) {
    case Provider.GOOGLE:
      userInfo = await Google.logIn(code);
      break;
    case Provider.FACEBOOK:
      userInfo = await Facebook.login(code);
      break;
    default:
      throw new Error(`Unsuporrted OAuth provider: ${provider}`);
  }
  if (!userInfo) {
    throw new Error(`${provider} login error`);
  }
  const { _id, name, avatar, contact } = userInfo;
  if (!_id || !name || !avatar || !contact) {
    throw new Error(`${provider} login error`);
  }
  const updateRes = await db.users.findOneAndUpdate(
    {
      _id,
    },
    {
      $set: {
        name,
        avatar,
        contact,
        token,
      },
    },
    { returnOriginal: false }
  );
  let viewer = updateRes.value;
  // if the user doesn't exist yet, insert a new one
  if (!viewer) {
    const insertRes = await db.users.insertOne({
      _id,
      token,
      name,
      avatar,
      contact,
      income: 0,
      bookings: [],
      listings: [],
    });
    viewer = insertRes.ops[0];
  }
  res.cookie(COOKIE_NAME, _id, {
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
    authUrl: (_root: undefined, { input }: AuthUrlArgs): string => {
      try {
        switch (input.provider) {
          case Provider.GOOGLE:
            return Google.authUrl;
          case Provider.FACEBOOK:
            return Facebook.authUrl;
          default:
            throw new Error(`Unsupported OAuth provider: ${input.provider}`);
        }
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
        const provider = input ? input.provider : null;
        const token = crypto.randomBytes(16).toString('hex');
        const viewer =
          code && provider
            ? await logInViaProvider(provider, code, token, db, res)
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
