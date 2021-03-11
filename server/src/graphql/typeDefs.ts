import { gql } from "apollo-server-express";

export const typeDefs = gql`
  scalar Date

  scalar DateTime

  interface Error {
    message: String!
  }

  type UserInputError implements Error @entity {
    message: String! @column
    input: String! @column
  }

  type UserInputErrors @entity {
    errors: [UserInputError!]! @embedded
  }

  type AuthenticationError implements Error @entity {
    message: String! @column
  }

  type DatabaseError implements Error @entity {
    message: String! @column
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

  type PasswordIdentity {
    email: String!
    password: String!
  }

  type OAuthIdentity {
    provider: Provider!
    userId: String!
  }

  union Identity = PasswordIdentity | OAuthIdentity

  type User
    @entity(
      additionalFields: [
        { path: "status", type: "UserStatus" }
        { path: "token?", type: "string" }
        { path: "walletId?", type: "string" }
        { path: "identities", type: "Array<UserIdentityDocument['_id']>" }
      ]
    ) {
    id: ID! @id
    name: String! @column
    avatar: String @column
    contact: String! @column
    income: Float @column
    bookings(lastId: ID, limit: Int!): [Booking!] @link
    listings(lastId: ID, limit: Int!): [Listing!]! @link
    authorized: Boolean @column # need to add this so this field appears under UserDocument, but it is not persisted in MongoDB
    hasWallet: Boolean!
  }

  # type BookingsInfo {
  #   total: Int!
  #   result: [Booking!]!
  # }

  # type ListingsInfo {
  #   total: Int!
  #   result: [Listing!]!
  # }

  type UserIdentity @entity {
    id: ID! @id
    userGuid: User! @link
    identity: Identity! @column
  }

  type EmailVerification @entity {
    id: User! @link @id
    token: String! @column
    createdAt: DateTime! @column
  }

  type Listing
    @entity(
      additionalFields: [
        { path: "country", type: "string" }
        { path: "admin", type: "string" }
        {
          path: "bookingsIndex"
          type: "{ [year: string]: { [month: string]: { [day: string]: boolean } } }"
        }
      ]
    ) {
    id: ID! @id
    title: String! @column
    description: String! @column
    image: String! @column
    host: User! @link
    type: ListingType! @column
    address: String! @column
    city: String! @column
    bookings(lastId: ID, limit: Int!): [Booking!]! @link # bookings made against this listing
    bookingsIndex: String! # we stringify the bookingsIndex object to get this
    price: Float! @column
    numOfGuests: Int! @column # maximum number of guests
  }

  type Booking @entity {
    id: ID! @id
    listing: Listing! @link
    tenant: User! @link
    checkIn: Date! @column
    checkOut: Date! @column
  }

  type Viewer @entity {
    id: ID @id
    status: UserStatus @column
    contact: String @column
    token: String @column
    avatar: String @column
    hasWallet: Boolean @column
    didRequest: Boolean! @column
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

  union SignUpResult @union(discriminatorField: "__typename") =
      Viewer
    | UserInputErrors
    | DatabaseError

  union ResendVerificationEmailResult @union(discriminatorField: "__typename") =
      Viewer
    | DatabaseError

  union VerifyEmailResult @union(discriminatorField: "__typename") =
      Viewer
    | DatabaseError
    | AuthenticationError

  union LogInResult @union(discriminatorField: "__typename") =
      Viewer
    | UserInputErrors
    | AuthenticationError
    | DatabaseError

  union UserResult @union(discriminatorField: "__typename") =
      User
    | DatabaseError

  type Query {
    authUrl(provider: Provider!): String!
    user(id: ID!): UserResult!
  }

  type Mutation {
    signUp(input: SignUpInput!): SignUpResult!
    resendVerificationEmail(email: String!): ResendVerificationEmailResult!
    verifyEmail(token: String!): VerifyEmailResult!
    logIn(input: LogInInput): LogInResult!
    logOut: Viewer!
  }
`;
