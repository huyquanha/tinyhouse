/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: User
// ====================================================

export interface User_user_User_bookings_listing {
  __typename: "Listing";
  id: string;
  title: string;
  image: string;
  address: string;
  price: number;
  numOfGuests: number;
}

export interface User_user_User_bookings {
  __typename: "Booking";
  id: string;
  listing: User_user_User_bookings_listing;
  checkIn: Date;
  checkOut: Date;
}

export interface User_user_User_listings {
  __typename: "Listing";
  id: string;
  title: string;
  image: string;
  address: string;
  price: number;
  numOfGuests: number;
}

export interface User_user_User {
  __typename: "User";
  id: string;
  name: string;
  avatar: string | null;
  contact: string;
  hasWallet: boolean;
  income: number | null;
  bookings: User_user_User_bookings[] | null;
  listings: User_user_User_listings[];
}

export interface User_user_DatabaseError {
  __typename: "DatabaseError";
  message: string;
}

export type User_user = User_user_User | User_user_DatabaseError;

export interface User {
  user: User_user;
}

export interface UserVariables {
  id: string;
  bookingsLastId?: string | null;
  bookingsLimit: number;
  listingsLastId?: string | null;
  listingsLimit: number;
}
