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

export interface AuthUrlInput {
  provider: Provider;
}

export interface LogInInput {
  provider: Provider;
  code: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
