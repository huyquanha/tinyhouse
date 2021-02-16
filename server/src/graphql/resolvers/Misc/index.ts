import { IResolvers } from "apollo-server-express";

export const miscResolvers: IResolvers = [
  "Error",
  "Identity",
  "SignUpResult",
  "ResendVerificationEmailResult",
  "VerifyEmailResult",
  "LogInResult",
].reduce((accum, k) => {
  accum[k] = {
    __resolveType: (obj: { __typename: string }): string => obj.__typename,
  };
  return accum;
}, {} as IResolvers);
// {
//   Error: {
//     __resolveType: (_root: undefined, obj: { __typename: string }): string =>
//       obj.__typename,
//   },
//   Identity: {
//     __resolveType: (_root: undefined, obj: { __typename: string }): string =>
//       obj.__typename,
//   },
//   SignUpResult: {
//     __resolveType: (_root: undefined, obj: { __typename: string }): string =>
//       obj.__typename,
//   },
//   ResendVerificationEmailResult: {
//     __resolveType: (_root: undefined, obj: { __typename: string }): string =>
//       obj.__typename,
//   },
//   VerifyEmailResult: {
//     __resolveType: (_root: undefined, obj: { __typename: string }): string =>
//       obj.__typename,
//   },
//   LogInResult: {
//     __resolveType: (_root: undefined, obj: { __typename: string }): string =>
//       obj.__typename,
//   },
// };
