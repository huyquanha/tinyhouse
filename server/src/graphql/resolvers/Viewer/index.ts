import { ApolloError, IResolvers } from "apollo-server-express";
import {
  Viewer,
  DatabaseError,
  AuthenticationError,
  UserInputErrors,
  UserInputError,
  User,
  Database,
  Provider,
  UserStatus,
  Facebook,
  Google,
} from "../../../lib";
import {
  SignUpResult,
  ResendVerificationEmailResult,
  VerifyEmailResult,
  LogInResult,
  MutationLogInArgs,
  QueryAuthUrlArgs,
  MutationSignUpArgs,
  MutationVerifyEmailArgs,
  MutationResendVerificationEmailArgs,
} from "./types";
import crypto from "crypto";
import { Request, Response } from "express";
import { VIEWER_COOKIE } from "./cookieOptions";
import { sendVerificationEmail, signUp, verifyEmail } from "./signUp";
import { logInViaCookie, logInViaEmail, logInViaProvider } from "./logIn";
import { cookieOptions } from "./cookieOptions";

const isUser = (
  user: User | UserInputErrors | DatabaseError | AuthenticationError
): user is User => (user as User)._id !== undefined;

export const viewerResolvers: IResolvers = {
  Query: {
    authUrl: (_root: undefined, { provider }: QueryAuthUrlArgs): string => {
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
      { input }: MutationSignUpArgs,
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
      const userOrError = await signUp(db, name, email, password, avatar);
      // because the user does not verify email yet, we don't add cookie and only return email
      if (isUser(userOrError)) {
        return {
          __typename: "Viewer",
          contact: userOrError.contact,
          didRequest: true,
        };
      }
      // this is an expected error
      return userOrError;
    },
    resendVerificationEmail: async (
      _root: undefined,
      { email }: MutationResendVerificationEmailArgs,
      { db }: { db: Database }
    ): Promise<ResendVerificationEmailResult> => {
      const user = await db.users.findOne({
        contact: email,
      });
      if (!user) {
        return {
          __typename: "DatabaseError",
          message: "User not found",
        };
      }
      const userOrError = await sendVerificationEmail(db, user);
      if (isUser(userOrError)) {
        return {
          __typename: "Viewer",
          contact: user.contact,
          didRequest: true,
        };
      }
      return userOrError;
    },
    verifyEmail: async (
      _root: undefined,
      { token }: MutationVerifyEmailArgs,
      { db, res }: { db: Database; res: Response }
    ): Promise<VerifyEmailResult> => {
      const userOrError = await verifyEmail(db, token, res);
      if (isUser(userOrError)) {
        return {
          __typename: "Viewer",
          _id: userOrError._id,
          status: userOrError.status,
          contact: userOrError.contact,
          token: userOrError.token,
          avatar: userOrError.avatar,
          walletId: userOrError.walletId,
          didRequest: true,
        };
      }
      return userOrError;
    },
    logIn: async (
      _root: undefined,
      { input }: MutationLogInArgs,
      { db, req, res }: { db: Database; req: Request; res: Response }
    ): Promise<LogInResult> => {
      const token = crypto.randomBytes(16).toString("hex");
      let userOrError:
        | User
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
      if (isUser(userOrError)) {
        return {
          __typename: "Viewer",
          _id: userOrError._id,
          status: userOrError.status,
          contact: userOrError.contact,
          token: userOrError.token,
          avatar: userOrError.avatar,
          walletId: userOrError.walletId,
          didRequest: true,
        };
      }
      return userOrError;
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
  Viewer: {
    id: (viewer: Viewer): string | undefined => viewer._id?.toHexString(),
    hasWallet: (viewer: Viewer): boolean | null =>
      viewer.walletId ? true : null,
  },
  UserStatus: {
    ACTIVE: UserStatus.ACTIVE,
    PENDING: UserStatus.PENDING,
  },
};
