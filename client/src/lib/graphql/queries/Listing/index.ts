import { gql } from "@apollo/client";

export const LISTING = gql`
  query Listing($id: ID!, $bookingsLastId: ID, $bookingsLimit: Int!) {
    listing(id: $id) {
      __typename
      ... on Listing {
        id
        title
        description
        image
        host {
          id
          name
          avatar
          hasWallet
        }
        type
        address
        city
        bookings(lastId: $bookingsLastId, limit: $bookingsLimit) {
          id
          tenant {
            id
            name
            avatar
          }
          checkIn
          checkOut
        }
        bookingsIndex
        price
        numOfGuests
      }
      ... on DatabaseError {
        message
      }
    }
  }
`;
