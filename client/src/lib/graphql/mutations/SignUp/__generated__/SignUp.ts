/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SignUpInput } from "./../../../globalTypes";

// ====================================================
// GraphQL mutation operation: SignUp
// ====================================================

export interface SignUp_signUp_Viewer {
  __typename: "Viewer";
  contact: string | null;
  didRequest: boolean;
}

export interface SignUp_signUp_UserInputErrors_errors {
  __typename: "UserInputError";
  message: string;
  input: string;
}

export interface SignUp_signUp_UserInputErrors {
  __typename: "UserInputErrors";
  errors: SignUp_signUp_UserInputErrors_errors[];
}

export interface SignUp_signUp_DatabaseError {
  __typename: "DatabaseError";
  message: string;
}

export type SignUp_signUp = SignUp_signUp_Viewer | SignUp_signUp_UserInputErrors | SignUp_signUp_DatabaseError;

export interface SignUp {
  signUp: SignUp_signUp;
}

export interface SignUpVariables {
  input: SignUpInput;
}
