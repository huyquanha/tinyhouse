import { gql } from "@apollo/client";

export const USER = gql`
  query User(
    $id: ID!
    $bookingsLastId: ID
    $bookingsLimit: Int!
    $listingsLastId: ID
    $listingsLimit: Int!
  ) {
    user(id: $id) {
      __typename
      ... on User {
        id
        name
        avatar
        contact
        hasWallet
        income
        bookings(lastId: $bookingsLastId, limit: $bookingsLimit) {
          id
          listing {
            id
            title
            image
            address
            price
            numOfGuests
          }
          checkIn
          checkOut
        }
        listings(lastId: $listingsLastId, limit: $listingsLimit) {
          id
          title
          image
          address
          price
          numOfGuests
        }
      }
      ... on DatabaseError {
        message
      }
    }
  }
`;
