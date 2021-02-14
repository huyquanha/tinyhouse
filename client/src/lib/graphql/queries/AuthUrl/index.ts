import { gql } from '@apollo/client';

// We have to use $provider because it will affect the generated attribute name
// in AuthUrlVariables. If we name it $input, the generated attribute will be "input"
// Here we want the attribute name to be "provider" to be clear
export const AUTH_URL = gql`
  query AuthUrl($provider: Provider!) {
    authUrl(provider: $provider)
  }
`;
