import { ApolloError, IResolvers } from "apollo-server-express";
import {
  Viewer,
  Provider,
  UserStatus,
  UserDocument,
  SignUpResult,
  DatabaseError,
  AuthenticationError,
  UserInputErrors,
  UserInputError,
  ResendVerificationEmailResult,
  VerifyEmailResult,
  LogInResult,
} from "../../../lib/types";
import { Database } from "../../../database";
import { Facebook, Google } from "../../../lib/api";
import { AuthUrlArgs, LogInArgs, SignUpArgs, VerifyEmailArgs } from "./types";
import crypto from "crypto";
import { Request, Response } from "express";
import { VIEWER_COOKIE } from "./cookieOptions";
import { sendVerificationEmail, signUp, verifyEmail } from "./signUp";
import { logInViaCookie, logInViaEmail, logInViaProvider } from "./logIn";
import { cookieOptions } from "./cookieOptions";

const isUserDocument = (
  user: UserDocument | UserInputErrors | DatabaseError | AuthenticationError
): user is UserDocument => (user as UserDocument)._id !== undefined;

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (_root: undefined, { provider }: AuthUrlArgs): string => {
      switch (provider) {
        case Provider.GOOGLE:
          return Google.authUrl;
        case Provider.FACEBOOK:
          return Facebook.authUrl;
        default:
          throw new ApolloError(`Unsupported OAuth provider: ${provider}`);
      }
    },
  },
  Mutation: {
    signUp: async (
      _root: undefined,
      { input }: SignUpArgs,
      { db }: { db: Database; req: Request; res: Response }
    ): Promise<SignUpResult> => {
      const { name, email, avatar, password } = input;
      const inputErrors = Object.keys(input)
        .map((k) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (k !== "avatar" && !(input as any)[k]) {
            return {
              message: `${
                k.charAt(0).toLocaleUpperCase() + k.slice(1)
              } is required`,
              input: k,
            };
          }
        })
        .filter((e) => e);
      if (inputErrors.length > 0) {
        return {
          __typename: "UserInputErrors",
          errors: inputErrors as UserInputError[],
        };
      }
      const userOrError = await signUp(db, name, email, password, avatar)
      // because the user does not verify email yet, we don't add cookie and only return email
      if (isUserDocument(userOrError)) {
        return {
          __typename: "Viewer",
          contact: userOrError.contact,
          didRequest: true,
        };
      } else {
        // this is an expected error
        return userOrError;
      }
    },
    resendVerificationEmail: async (
      _root: undefined,
      { email }: { email: string },
      { db }: { db: Database }
    ): Promise<ResendVerificationEmailResult> => {
      const viewer = await db.users.findOne({
        contact: email,
      });
      if (!viewer) {
        return {
          __typename: "DatabaseError",
          message: "User not found",
        };
      }
      return sendVerificationEmail(db, viewer);
    },
    verifyEmail: async (
      _root: undefined,
      { token }: VerifyEmailArgs,
      { db, res }: { db: Database; res: Response }
    ): Promise<VerifyEmailResult> => {
      const userOrError = await verifyEmail(db, token, res);
      if (isUserDocument(userOrError)) {
        return {
          __typename: "Viewer",
          id: userOrError._id.toHexString(),
          status: userOrError.status,
          contact: userOrError.contact,
          token: userOrError.token,
          avatar: userOrError.avatar,
          hasWallet: !!userOrError.walletId,
          didRequest: true,
        };
      } else {
        // expected error
        return userOrError;
      }
    },
    logIn: async (
      _root: undefined,
      { input }: LogInArgs,
      { db, req, res }: { db: Database; req: Request; res: Response }
    ): Promise<LogInResult> => {
      const token = crypto.randomBytes(16).toString("hex");
      let userOrError:
        | UserDocument
        | UserInputErrors
        | AuthenticationError
        | DatabaseError;
      if (input) {
        const { email, password, code, provider } = input;
        if (email && password) {
          userOrError = await logInViaEmail(email, password, token, db, res);
        } else if (code && provider) {
          userOrError = await logInViaProvider(provider, code, token, db, res);
        } else {
          throw new ApolloError(
            `Unsupported login input format: ${JSON.stringify(
              Object.keys(input)
            )}`
          );
        }
      } else {
        // log in via cookie
        userOrError = await logInViaCookie(token, db, req, res);
      }
      if (isUserDocument(userOrError)) {
        return {
          __typename: "Viewer",
          id: userOrError._id.toHexString(),
          status: userOrError.status,
          contact: userOrError.contact,
          token: userOrError.token,
          avatar: userOrError.avatar,
          hasWallet: !!userOrError.walletId,
          didRequest: true,
        };
      } else {
        return userOrError;
      }
    },
    logOut: (
      _root: undefined,
      _args: Record<string, unknown>,
      { res }: { res: Response }
    ): Viewer => {
      // most browsers will only clear the cookie if the options are identical to when
      // the cookie is set (except expires or maxAge property)
      res.clearCookie(VIEWER_COOKIE, cookieOptions);
      return { __typename: "Viewer", didRequest: true };
    },
  },
  UserStatus: {
    ACTIVE: UserStatus.ACTIVE,
    PENDING: UserStatus.PENDING,
  },
};
