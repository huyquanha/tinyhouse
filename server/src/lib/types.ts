import { Collection, ObjectId } from "mongodb";
import { UserStatus, ListingType, Provider } from "./constants";

export interface Error {
  message: string;
}

export interface UserInputErrors {
  __typename?: "UserInputErrors";
  errors: UserInputError[];
}

export interface UserInputError extends Error {
  __typename?: "UserInputError";
  input: string;
}

export interface AuthenticationError extends Error {
  __typename?: "AuthenticationError";
}

export interface DatabaseError extends Error {
  __typename?: "DatabaseError";
}

export interface User {
  __typename?: "User";
  _id: ObjectId;
  status: UserStatus;
  token?: string;
  name: string;
  avatar?: string;
  contact: string;
  walletId?: string;
  income: number;
  bookings: ObjectId[];
  listings: ObjectId[];
  identities: ObjectId[];
  authorized?: boolean;
}

export interface PasswordIdentity {
  __typename?: "PasswordIdentity";
  email: string;
  password: string;
}

export interface OAuthIdentity {
  __typename?: "OAuthIdentity";
  provider: Provider;
  userId: string;
}

export type Identity = PasswordIdentity | OAuthIdentity;

// each user can have multiple identities
export interface UserIdentity {
  __typename?: "UserIdentity";
  _id: ObjectId; // global unique identitifier for each identity
  userGuid: ObjectId; // global unique identifier for user, linked to User collection
  identity: Identity;
}

export interface EmailVerification {
  __typename?: "EmailVerification";
  _id: ObjectId; // same as User _id
  token: string; // randomly generated token
  createdAt: Date;
}

export interface Booking {
  __typename?: "Booking";
  _id: ObjectId;
  listing: ObjectId;
  tenant: ObjectId; // id of the person who made the booking
  checkIn: Date;
  checkOut: Date;
}

export interface BookingsIndexMonth {
  [key: string]: boolean; // key will be the day of month. true if the date has been booked
}

export interface BookingsIndexYear {
  [key: string]: BookingsIndexMonth; // key will be the month of the year
}

export interface BookingsIndex {
  [key: string]: BookingsIndexYear; // key will be the year
}

export interface Listing {
  __typename?: "Listing";
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: ObjectId;
  type: ListingType;
  address: string;
  country: string;
  admin: string; // similar to states or provinces
  city: string;
  bookings: ObjectId[]; // bookings made against this listing
  bookingsIndex: BookingsIndex; // store the dates the listing have been booked as nested key-value pairs
  price: number;
  numOfGuests: number; // maximum number of guests
}

export interface Database {
  bookings: Collection<Booking>;
  listings: Collection<Listing>;
  users: Collection<User>;
  userIdentities: Collection<UserIdentity>;
  emailVerifications: Collection<EmailVerification>;
}

export interface Viewer {
  __typename?: "Viewer";
  _id?: ObjectId;
  status?: UserStatus;
  contact?: string;
  token?: string;
  avatar?: string;
  walletId?: string;
  didRequest: boolean;
}
