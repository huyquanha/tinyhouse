import { UserStatus } from "./constants";
import { ListingType } from "./constants";
import { Provider } from "./constants";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: Date;
  DateTime: Date;
};

export type Error = {
  readonly message: Scalars["String"];
};

export type UserInputError = Error & {
  readonly __typename?: "UserInputError";
  readonly message: Scalars["String"];
  readonly input: Scalars["String"];
};

export type UserInputErrors = {
  readonly __typename?: "UserInputErrors";
  readonly errors: ReadonlyArray<UserInputError>;
};

export type AuthenticationError = Error & {
  readonly __typename?: "AuthenticationError";
  readonly message: Scalars["String"];
};

export type DatabaseError = Error & {
  readonly __typename?: "DatabaseError";
  readonly message: Scalars["String"];
};

export { Provider };

export { UserStatus };

export { ListingType };

export type PasswordIdentity = {
  readonly __typename?: "PasswordIdentity";
  readonly email: Scalars["String"];
  readonly password: Scalars["String"];
};

export type OAuthIdentity = {
  readonly __typename?: "OAuthIdentity";
  readonly provider: Provider;
  readonly userId: Scalars["String"];
};

export type Identity = PasswordIdentity | OAuthIdentity;

export type User = {
  readonly __typename?: "User";
  readonly id: Scalars["ID"];
  readonly name: Scalars["String"];
  readonly avatar?: Maybe<Scalars["String"]>;
  readonly contact: Scalars["String"];
  readonly income?: Maybe<Scalars["Float"]>;
  readonly bookings?: Maybe<ReadonlyArray<Booking>>;
  readonly listings: ReadonlyArray<Listing>;
  readonly hasWallet: Scalars["Boolean"];
  readonly authorized?: Maybe<Scalars["Boolean"]>;
};

export type UserBookingsArgs = {
  lastId?: Maybe<Scalars["ID"]>;
  limit: Scalars["Int"];
};

export type UserListingsArgs = {
  lastId?: Maybe<Scalars["ID"]>;
  limit: Scalars["Int"];
};

export type UserIdentity = {
  readonly __typename?: "UserIdentity";
  readonly id: Scalars["ID"];
  readonly userGuid: User;
  readonly identity: Identity;
};

export type EmailVerification = {
  readonly __typename?: "EmailVerification";
  readonly id: User;
  readonly token: Scalars["String"];
  readonly createdAt: Scalars["DateTime"];
};

export type Listing = {
  readonly __typename?: "Listing";
  readonly id: Scalars["ID"];
  readonly title: Scalars["String"];
  readonly description: Scalars["String"];
  readonly image: Scalars["String"];
  readonly host: User;
  readonly type: ListingType;
  readonly address: Scalars["String"];
  readonly city: Scalars["String"];
  readonly bookings: ReadonlyArray<Booking>;
  readonly bookingsIndex: Scalars["String"];
  readonly price: Scalars["Float"];
  readonly numOfGuests: Scalars["Int"];
};

export type ListingBookingsArgs = {
  lastId?: Maybe<Scalars["ID"]>;
  limit: Scalars["Int"];
};

export type Booking = {
  readonly __typename?: "Booking";
  readonly id: Scalars["ID"];
  readonly listing: Listing;
  readonly tenant: User;
  readonly checkIn: Scalars["Date"];
  readonly checkOut: Scalars["Date"];
};

export type Viewer = {
  readonly __typename?: "Viewer";
  readonly id?: Maybe<Scalars["ID"]>;
  readonly status?: Maybe<UserStatus>;
  readonly contact?: Maybe<Scalars["String"]>;
  readonly token?: Maybe<Scalars["String"]>;
  readonly avatar?: Maybe<Scalars["String"]>;
  readonly hasWallet?: Maybe<Scalars["Boolean"]>;
  readonly didRequest: Scalars["Boolean"];
};

export type SignUpInput = {
  readonly name: Scalars["String"];
  readonly avatar?: Maybe<Scalars["String"]>;
  readonly email: Scalars["String"];
  readonly password: Scalars["String"];
};

export type LogInInput = {
  readonly provider?: Maybe<Provider>;
  readonly code?: Maybe<Scalars["String"]>;
  readonly email?: Maybe<Scalars["String"]>;
  readonly password?: Maybe<Scalars["String"]>;
};

export type SignUpResult = Viewer | UserInputErrors | DatabaseError;

export type ResendVerificationEmailResult = Viewer | DatabaseError;

export type VerifyEmailResult = Viewer | DatabaseError | AuthenticationError;

export type LogInResult =
  | Viewer
  | UserInputErrors
  | AuthenticationError
  | DatabaseError;

export type UserResult = User | DatabaseError;

export type Query = {
  readonly __typename?: "Query";
  readonly authUrl: Scalars["String"];
  readonly user: UserResult;
};

export type QueryAuthUrlArgs = {
  provider: Provider;
};

export type QueryUserArgs = {
  id: Scalars["ID"];
};

export type Mutation = {
  readonly __typename?: "Mutation";
  readonly signUp: SignUpResult;
  readonly resendVerificationEmail: ResendVerificationEmailResult;
  readonly verifyEmail: VerifyEmailResult;
  readonly logIn: LogInResult;
  readonly logOut: Viewer;
};

export type MutationSignUpArgs = {
  input: SignUpInput;
};

export type MutationResendVerificationEmailArgs = {
  email: Scalars["String"];
};

export type MutationVerifyEmailArgs = {
  token: Scalars["String"];
};

export type MutationLogInArgs = {
  input?: Maybe<LogInInput>;
};

export type AdditionalEntityFields = {
  readonly path?: Maybe<Scalars["String"]>;
  readonly type?: Maybe<Scalars["String"]>;
};

import { ObjectID } from "mongodb";
export type UserInputErrorDocument = {
  message: string;
  input: string;
};

export type UserInputErrorsDocument = {
  errors: Array<UserInputErrorDocument>;
};

export type AuthenticationErrorDocument = {
  message: string;
};

export type DatabaseErrorDocument = {
  message: string;
};

export type UserDocument = {
  _id: ObjectID;
  name: string;
  avatar?: Maybe<string>;
  contact: string;
  income?: Maybe<number>;
  bookings?: Maybe<Array<BookingDocument["_id"]>>;
  listings: Array<ListingDocument["_id"]>;
  authorized?: Maybe<boolean>;
  status: UserStatus;
  token?: string;
  walletId?: string;
  identities: Array<UserIdentityDocument["_id"]>;
};

export type UserIdentityDocument = {
  _id: ObjectID;
  userGuid: UserDocument["_id"];
  identity: Identity;
};

export type EmailVerificationDocument = {
  _id: ObjectID;
  token: string;
  createdAt: Date;
};

export type ListingDocument = {
  _id: ObjectID;
  title: string;
  description: string;
  image: string;
  host: UserDocument["_id"];
  type: ListingType;
  address: string;
  city: string;
  bookings: Array<BookingDocument["_id"]>;
  price: number;
  numOfGuests: number;
  country: string;
  admin: string;
  bookingsIndex: {
    [year: string]: { [month: string]: { [day: string]: boolean } };
  };
};

export type BookingDocument = {
  _id: ObjectID;
  listing: ListingDocument["_id"];
  tenant: UserDocument["_id"];
  checkIn: Date;
  checkOut: Date;
};

export type ViewerDocument = {
  _id?: Maybe<ObjectID>;
  status?: Maybe<UserStatus>;
  contact?: Maybe<string>;
  token?: Maybe<string>;
  avatar?: Maybe<string>;
  hasWallet?: Maybe<boolean>;
  didRequest: boolean;
};

export type SignUpResultDocument = (
  | ViewerDocument
  | UserInputErrorsDocument
  | DatabaseErrorDocument
) & {
  __typename: string;
};

export type ResendVerificationEmailResultDocument = (
  | ViewerDocument
  | DatabaseErrorDocument
) & {
  __typename: string;
};

export type VerifyEmailResultDocument = (
  | ViewerDocument
  | DatabaseErrorDocument
  | AuthenticationErrorDocument
) & {
  __typename: string;
};

export type LogInResultDocument = (
  | ViewerDocument
  | UserInputErrorsDocument
  | AuthenticationErrorDocument
  | DatabaseErrorDocument
) & {
  __typename: string;
};

export type UserResultDocument = (UserDocument | DatabaseErrorDocument) & {
  __typename: string;
};
