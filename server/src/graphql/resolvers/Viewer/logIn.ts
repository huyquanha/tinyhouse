import { VIEWER_COOKIE } from "./cookieOptions";
import {
  AuthenticationError,
  DatabaseError,
  PasswordIdentity,
  Provider,
  UserDocument,
  UserInputErrors,
  UserStatus,
} from "../../../lib/types";
import { Database } from "../../../database";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { Facebook, Google, UserInfo } from "../../../lib/api";
import { ObjectId } from "mongodb";
import { cookieOptions } from "./cookieOptions";

export const logInViaEmail = async (
  email: string,
  password: string,
  token: string,
  db: Database,
  res: Response
): Promise<UserDocument | UserInputErrors | DatabaseError> => {
  const user = await db.users.findOne({
    contact: email,
  });
  const userIdentity = await db.userIdentities.findOne({
    "identity.email": email,
  });
  // use case: user logs in via provider only so doesn't have
  // an email identity => missing identity should also throws
  if (!user || !userIdentity) {
    return {
      __typename: "UserInputErrors",
      errors: [
        {
          message: `Email doesn't exist`,
          input: "email",
        },
      ],
    };
  }
  const passwordIdentity = userIdentity.identity as PasswordIdentity;
  if (!passwordIdentity.password) {
    throw new Error(`Missing password in identity: ${userIdentity._id}`);
  }
  // compare passsword
  const valid = await bcrypt.compare(password, passwordIdentity.password);
  if (!valid) {
    return {
      __typename: "UserInputErrors",
      errors: [
        {
          message: "Incorrect password",
          input: "password",
        },
      ],
    };
  } else {
    if (user.status === UserStatus.ACTIVE) {
      const updateRes = await db.users.findOneAndUpdate(
        {
          _id: userIdentity.userGuid,
        },
        {
          $set: {
            token,
          },
        },
        {
          returnOriginal: false,
        }
      );
      const viewer = updateRes.value;
      if (!viewer) {
        return {
          __typename: "DatabaseError",
          message: "User not found or failed to be updated",
        };
      }
      res.cookie(VIEWER_COOKIE, viewer._id.toHexString(), {
        ...cookieOptions,
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      });
      return viewer;
    }
    // return user as is if its status is still pending
    return user;
  }
};

export const logInViaProvider = async (
  provider: Provider,
  code: string,
  token: string,
  db: Database,
  res: Response
): Promise<
  UserDocument | UserInputErrors | AuthenticationError | DatabaseError
> => {
  let userInfo: UserInfo | null = null;
  switch (provider) {
    case Provider.GOOGLE:
      userInfo = await Google.logIn(code);
      break;
    case Provider.FACEBOOK:
      userInfo = await Facebook.login(code);
      break;
    default:
      return {
        __typename: "UserInputErrors",
        errors: [
          {
            message: `Unsuporrted OAuth provider: ${provider}`,
            input: "provider",
          },
        ],
      };
  }
  if (!userInfo) {
    return {
      __typename: "AuthenticationError",
      message: `${provider} login error: missing user info`,
    };
  }
  const { userId, name, avatar, contact } = userInfo;
  if (!userId || !name || !contact) {
    return {
      __typename: "AuthenticationError",
      message: `${provider} login error: Missing required user details`,
    };
  }
  const existingIdentity = await db.userIdentities.findOne({
    "identity.provider": provider,
    "identity.userId": userId,
  });
  let viewer: UserDocument | null | undefined;
  if (!existingIdentity) {
    // check if user with the same email exist
    const sameEmailUser = await db.users.findOne({
      contact,
    });
    if (sameEmailUser) {
      const identityId = new ObjectId();
      const userPromise = db.users.findOneAndUpdate(
        {
          _id: sameEmailUser._id,
        },
        {
          $push: {
            identities: identityId,
          },
          $set: {
            token,
            // use case: user first signs up using email but has not verified,
            // then user signs in using identity provider. The fact that this is possible
            // proves user owns the email => we can set the status to active
            status: UserStatus.ACTIVE,
          },
        },
        {
          returnOriginal: false,
        }
      );
      const identityPromise = db.userIdentities.insertOne({
        _id: identityId,
        userGuid: sameEmailUser._id,
        identity: {
          userId,
          provider,
        },
      });
      const [userRes] = await Promise.all([userPromise, identityPromise]);
      viewer = userRes.value;
    } else {
      const userGuid = new ObjectId();
      const identityId = new ObjectId();
      const userPromise = db.users.insertOne({
        _id: userGuid,
        status: UserStatus.ACTIVE,
        token,
        name,
        avatar,
        contact,
        income: 0,
        bookings: [],
        listings: [],
        identities: [identityId],
      });
      const identityPromise = db.userIdentities.insertOne({
        _id: identityId,
        userGuid,
        identity: {
          userId,
          provider,
        },
      });
      const [userRes] = await Promise.all([userPromise, identityPromise]);
      viewer = userRes.ops[0];
    }
  } else {
    // we don't update user details with what we retrieve from the auth provider
    // because we consider the user details on our site the source of truth.
    const updateRes = await db.users.findOneAndUpdate(
      {
        _id: existingIdentity.userGuid,
      },
      {
        $set: {
          token,
        },
      },
      {
        returnOriginal: false,
      }
    );
    viewer = updateRes.value;
  }
  if (!viewer) {
    return {
      __typename: "DatabaseError",
      message: "User not found or failed to be updated",
    };
  }
  res.cookie(VIEWER_COOKIE, viewer._id.toHexString(), {
    ...cookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
  });
  return viewer;
};

export const logInViaCookie = async (
  token: string,
  db: Database,
  req: Request,
  res: Response
): Promise<UserDocument | AuthenticationError | DatabaseError> => {
  if (!req.signedCookies[VIEWER_COOKIE]) {
    return {
      __typename: "AuthenticationError",
      message: "Missing authentication cookie",
    };
  }
  const updateRes = await db.users.findOneAndUpdate(
    {
      _id: new ObjectId(req.signedCookies[VIEWER_COOKIE]),
    },
    {
      $set: { token },
    },
    { returnOriginal: false }
  );
  const viewer = updateRes.value;
  if (!viewer) {
    res.clearCookie(VIEWER_COOKIE, cookieOptions);
    return {
      __typename: "DatabaseError",
      message: "User not found or failed to be updated",
    };
  } else {
    return viewer;
  }
};
