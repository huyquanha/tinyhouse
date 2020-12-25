import { gql } from '@apollo/client';

export const AUTH_URL = gql`
  query AuthUrl($input: AuthUrlInput!) {
    authUrl(input: $input)
  }
`;
