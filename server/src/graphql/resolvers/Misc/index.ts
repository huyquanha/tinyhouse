import { IResolvers } from "apollo-server-express";

export const miscResolvers: IResolvers = [
  "Error",
  "Identity",
  "SignUpResult",
  "ResendVerificationEmailResult",
  "VerifyEmailResult",
  "LogInResult",
  "UserResult",
].reduce((accum, k) => {
  accum[k] = {
    __resolveType: (obj: { __typename: string }): string => obj.__typename,
  };
  return accum;
}, {} as IResolvers);
