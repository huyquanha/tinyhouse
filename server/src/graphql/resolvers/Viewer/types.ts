import {
  AuthenticationError,
  DatabaseError,
  Provider,
  UserInputErrors,
  Viewer,
} from "../../../lib";

// inputs
export interface SignUpInput {
  readonly name: string;
  readonly avatar?: string;
  readonly email: string;
  readonly password: string;
}

export interface LogInInput {
  readonly provider?: Provider;
  readonly code?: string;
  readonly email?: string;
  readonly password?: string;
}

export interface QueryAuthUrlArgs {
  readonly provider: Provider;
}

export interface MutationSignUpArgs {
  readonly input: SignUpInput;
}

export interface MutationResendVerificationEmailArgs {
  readonly email: string;
}

export interface MutationVerifyEmailArgs {
  readonly token: string;
}

export interface MutationLogInArgs {
  readonly input?: LogInInput;
}

// Results
export type SignUpResult = Viewer | UserInputErrors | DatabaseError;

export type ResendVerificationEmailResult = Viewer | DatabaseError;

export type VerifyEmailResult = Viewer | DatabaseError | AuthenticationError;

export type LogInResult =
  | Viewer
  | UserInputErrors
  | AuthenticationError
  | DatabaseError;
