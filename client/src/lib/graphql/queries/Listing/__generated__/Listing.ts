/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ListingType } from "./../../../globalTypes";

// ====================================================
// GraphQL query operation: Listing
// ====================================================

export interface Listing_listing_Listing_host {
  __typename: "User";
  id: string;
  name: string;
  avatar: string | null;
  hasWallet: boolean;
}

export interface Listing_listing_Listing_bookings_tenant {
  __typename: "User";
  id: string;
  name: string;
  avatar: string | null;
}

export interface Listing_listing_Listing_bookings {
  __typename: "Booking";
  id: string;
  tenant: Listing_listing_Listing_bookings_tenant;
  checkIn: Date;
  checkOut: Date;
}

export interface Listing_listing_Listing {
  __typename: "Listing";
  id: string;
  title: string;
  description: string;
  image: string;
  host: Listing_listing_Listing_host;
  type: ListingType;
  address: string;
  city: string;
  bookings: Listing_listing_Listing_bookings[] | null;
  bookingsIndex: string;
  price: number;
  numOfGuests: number;
}

export interface Listing_listing_DatabaseError {
  __typename: "DatabaseError";
  message: string;
}

export type Listing_listing =
  | Listing_listing_Listing
  | Listing_listing_DatabaseError;

export interface Listing {
  listing: Listing_listing;
}

export interface ListingVariables {
  id: string;
  bookingsLastId?: string | null;
  bookingsLimit: number;
}
