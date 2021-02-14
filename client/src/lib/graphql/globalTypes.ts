/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum Provider {
  FACEBOOK = "FACEBOOK",
  GOOGLE = "GOOGLE",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
}

export interface LogInInput {
  provider?: Provider | null;
  code?: string | null;
  email?: string | null;
  password?: string | null;
}

export interface SignUpInput {
  name: string;
  avatar?: string | null;
  email: string;
  password: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
