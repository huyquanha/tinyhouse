import { sendEmail } from "../../../lib/email";
import { createVerificationEmail } from "../../../lib/email/templates/emailVerification";
import {
  UserDocument,
  UserStatus,
  DatabaseError,
  UserInputErrors,
  Viewer,
  AuthenticationError,
} from "../../../lib/types";
import { Database } from "../../../database";
import crypto from "crypto";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { Response } from "express";
import { VIEWER_COOKIE } from "./cookieOptions";
import { cookieOptions } from "./cookieOptions";

const SALT_ROUNDS = 10;

export const signUp = async (
  db: Database,
  name: string,
  email: string,
  password: string,
  avatar?: string
): Promise<UserDocument | UserInputErrors | DatabaseError> => {
  // check if user with the same email exists
  const sameEmailUser = await db.users.findOne({
    contact: email,
  });
  if (sameEmailUser) {
    return {
      __typename: "UserInputErrors",
      errors: [
        {
          message: `User with email: ${email} already exists`,
          input: "email",
        },
      ],
    };
  }
  const userGuid = new ObjectId();
  const identityId = new ObjectId();
  const userPromise = db.users.insertOne({
    _id: userGuid,
    status: UserStatus.PENDING,
    name,
    avatar,
    contact: email,
    income: 0,
    bookings: [],
    listings: [],
    identities: [identityId],
  });
  const identityPromise = db.userIdentities.insertOne({
    _id: identityId,
    userGuid,
    identity: {
      email,
      password: await bcrypt.hash(password, SALT_ROUNDS),
    },
  });
  const [userRes] = await Promise.all([userPromise, identityPromise]);
  const user = userRes.ops[0];
  if (!user) {
    return {
      __typename: "DatabaseError",
      message: "Failed to create user",
    };
  }
  await sendVerificationEmail(db, user);
  // because the user does not verify email yet, we don't add cookie and only return email
  return user;
};

export const sendVerificationEmail = async (
  db: Database,
  user: UserDocument
): Promise<Viewer | DatabaseError> => {
  // there is a tiny little chance that crypto.randomBytes() generate
  // the same token for another user, however with 128 bytes this is extremely unlikely
  const emailVerificationRes = await db.emailVerifications.findOneAndUpdate(
    {
      _id: user._id,
    },
    {
      $set: {
        token: crypto.randomBytes(128).toString("hex"),
        createdAt: new Date(),
      },
    },
    {
      upsert: true, // insert if not exist
      returnOriginal: false,
    }
  );
  const emailVerification = emailVerificationRes.value;
  if (!emailVerification) {
    return {
      __typename: "DatabaseError",
      message: "Unable to save verification token",
    };
  }
  // send verification email
  await sendEmail(createVerificationEmail(user, emailVerification));
  return {
    __typename: "Viewer",
    contact: user.contact,
    didRequest: true,
  };
};

export const verifyEmail = async (
  db: Database,
  token: string,
  res: Response
): Promise<UserDocument | AuthenticationError | DatabaseError> => {
  const verificationRecord = await db.emailVerifications.findOne({
    token,
  });
  if (!verificationRecord) {
    return {
      __typename: "AuthenticationError",
      message: "Token is invalid or has expired",
    };
  }
  const user = await db.users.findOne({
    _id: verificationRecord._id,
  });
  if (!user) {
    return {
      __typename: "DatabaseError",
      message: "User not found",
    };
  }
  const sessionToken = crypto.randomBytes(16).toString("hex");
  let viewer: UserDocument | undefined;
  if (user.status === UserStatus.ACTIVE) {
    // this means user has either logged in via an identity provider, which automatically confirms the email,
    // or the token has been used.
    // This also cater for the case when the original link has expired but user then logs in via an identity provider
    // When user requests another link, we only check the status of the user being active without caring about the token status
    const updateRes = await db.users.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        $set: {
          token: sessionToken,
        },
      },
      {
        returnOriginal: false,
      }
    );
    viewer = updateRes.value;
  } else {
    const userRes = await db.users.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        $set: {
          status: UserStatus.ACTIVE,
          token: sessionToken,
        },
      },
      {
        returnOriginal: false,
      }
    );
    viewer = userRes.value;
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
