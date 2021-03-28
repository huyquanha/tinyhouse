import { gql } from "@apollo/client";

export const LISTINGS = gql`
  query Listings($input: ListingsInput!) {
    listings(input: $input) {
      id
      title
      image
      address
      price
      numOfGuests
    }
  }
`;
