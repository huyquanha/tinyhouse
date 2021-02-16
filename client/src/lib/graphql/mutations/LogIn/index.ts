import { gql } from "@apollo/client";

export const LOG_IN = gql`
  mutation LogIn($input: LogInInput) {
    logIn(input: $input) {
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
      ... on UserInputErrors {
        errors {
          message
          input
        }
      }
      ... on Error {
        message
      }
    }
  }
`;
