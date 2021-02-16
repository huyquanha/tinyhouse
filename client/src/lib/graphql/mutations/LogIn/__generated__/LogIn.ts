/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { LogInInput, UserStatus } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: LogIn
// ====================================================

export interface LogIn_logIn_Viewer {
  __typename: "Viewer";
  id: string | null;
  status: UserStatus | null;
  contact: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}

export interface LogIn_logIn_UserInputErrors_errors {
  __typename: "UserInputError";
  message: string;
  input: string;
}

export interface LogIn_logIn_UserInputErrors {
  __typename: "UserInputErrors";
  errors: LogIn_logIn_UserInputErrors_errors[];
}

export interface LogIn_logIn_AuthenticationError {
  __typename: "AuthenticationError" | "DatabaseError";
  message: string;
}

export type LogIn_logIn =
  | LogIn_logIn_Viewer
  | LogIn_logIn_UserInputErrors
  | LogIn_logIn_AuthenticationError;

export interface LogIn {
  logIn: LogIn_logIn;
}

export interface LogInVariables {
  input?: LogInInput | null;
}
