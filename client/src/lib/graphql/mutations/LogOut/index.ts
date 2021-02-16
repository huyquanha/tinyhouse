import { gql } from "@apollo/client";

export const LOG_OUT = gql`
  mutation LogOut {
    logOut {
      id
      status
      contact
      token
      avatar
      hasWallet
      didRequest
    }
  }
`;
