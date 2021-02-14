/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserStatus } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: VerifyEmail
// ====================================================

export interface VerifyEmail_verifyEmail_Viewer {
  __typename: "Viewer";
  id: string | null;
  status: UserStatus | null;
  contact: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}

export interface VerifyEmail_verifyEmail_DatabaseError {
  __typename: "DatabaseError" | "AuthenticationError";
  message: string;
}

export type VerifyEmail_verifyEmail = VerifyEmail_verifyEmail_Viewer | VerifyEmail_verifyEmail_DatabaseError;

export interface VerifyEmail {
  verifyEmail: VerifyEmail_verifyEmail;
}

export interface VerifyEmailVariables {
  token: string;
}
