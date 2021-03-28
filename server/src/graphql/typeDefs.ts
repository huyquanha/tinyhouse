import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Date

  scalar DateTime

  interface Error {
    message: String!
  }

  type UserInputError implements Error {
    message: String!
    input: String!
  }

  type UserInputErrors {
    errors: [UserInputError!]!
  }

  type AuthenticationError implements Error {
    message: String!
  }

  type DatabaseError implements Error {
    message: String!
  }

  enum Provider {
    GOOGLE
    FACEBOOK
  }

  enum UserStatus {
    ACTIVE
    PENDING
  }

  enum ListingType {
    APARTMENT
    HOUSE
  }

  enum ListingsFilter {
    PRICE_LOW_TO_HIGH
    PRICE_HIGH_TO_LOW
  }

  type PasswordIdentity {
    email: String!
    password: String!
  }

  type OAuthIdentity {
    provider: Provider!
    userId: String!
  }

  union Identity = PasswordIdentity | OAuthIdentity

  type User {
    id: ID!
    name: String!
    avatar: String
    contact: String!
    income: Float
    bookings(lastId: ID, limit: Int!): [Booking!]
    listings(lastId: ID, limit: Int!): [Listing!]!
    authorized: Boolean
    hasWallet: Boolean!
  }

  type UserIdentity {
    id: ID!
    userGuid: User!
    identity: Identity!
  }

  type EmailVerification {
    id: User!
    token: String!
    createdAt: DateTime!
  }

  type Listing {
    id: ID!
    title: String!
    description: String!
    image: String!
    host: User!
    type: ListingType!
    address: String!
    city: String!
    bookings(lastId: ID, limit: Int!): [Booking!] # can be null if viewer is not authorized
    bookingsIndex: String! # we stringify the bookingsIndex object to get this
    price: Int! # in cents so can be integers
    numOfGuests: Int!
  }

  type Booking {
    id: ID!
    listing: Listing!
    tenant: User!
    checkIn: Date!
    checkOut: Date!
  }

  type Viewer {
    id: ID
    status: UserStatus
    contact: String
    token: String
    avatar: String
    hasWallet: Boolean
    didRequest: Boolean!
  }

  input SignUpInput {
    name: String!
    avatar: String
    email: String!
    password: String!
  }

  input LogInInput {
    provider: Provider
    code: String
    email: String
    password: String
  }

  input ListingsInput {
    filter: ListingsFilter!
    lastPrice: Int
    lastId: ID
    limit: Int!
  }

  union SignUpResult = Viewer | UserInputErrors | DatabaseError

  union ResendVerificationEmailResult = Viewer | DatabaseError

  union VerifyEmailResult = Viewer | DatabaseError | AuthenticationError

  union LogInResult =
      Viewer
    | UserInputErrors
    | AuthenticationError
    | DatabaseError

  union UserResult = User | DatabaseError

  union ListingResult = Listing | DatabaseError

  type Query {
    authUrl(provider: Provider!): String!
    user(id: ID!): UserResult!
    listing(id: ID!): ListingResult!
    listings(input: ListingsInput!): [Listing!]!
  }

  type Mutation {
    signUp(input: SignUpInput!): SignUpResult!
    resendVerificationEmail(email: String!): ResendVerificationEmailResult!
    verifyEmail(token: String!): VerifyEmailResult!
    logIn(input: LogInInput): LogInResult!
    logOut: Viewer!
  }
`;
