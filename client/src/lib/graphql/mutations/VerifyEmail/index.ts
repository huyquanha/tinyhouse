import { gql } from "@apollo/client";

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($token: String!) {
    verifyEmail(token: $token) {
      __typename
      ... on Viewer {
        id
        status
        contact
        token
        avatar
        hasWallet
        didRequest
      }
      ... on Error {
        message
      }
    }
  }
`;
