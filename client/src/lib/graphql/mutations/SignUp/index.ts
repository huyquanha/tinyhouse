import { gql } from '@apollo/client';

export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      __typename
      ... on Viewer {
        contact
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
