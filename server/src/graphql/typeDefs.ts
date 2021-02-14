import { gql } from 'apollo-server-express';

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

  type User @entity {
    id: ID! @id
    status: UserStatus! @column
    token: String @column
    name: String! @column
    avatar: String @column
    contact: String! @column
    walletId: String @column
    income: Float! @column
    bookings: [Booking!]! @link
    listings: [Listing!]! @link
    identities: [UserIdentity!]! @link
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

  type Listing @entity {
    id: ID! @id
    title: String! @column
    description: String! @column
    image: String! @column
    host: User! @link
    type: ListingType! @column
    address: String! @column
    country: String! @column
    admin: String! @column # similar to states or provinces
    city: String! @column
    bookings: [Booking!]! @link # bookings made against this listing
    price: Float! @column
    numOfGuests: Int! @column # maximum number of guests
  }

  type Booking @entity {
    id: ID! @id
    listing: Listing! @link
    tenant: User! @link
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

  type Query {
    authUrl(provider: Provider!): String!
  }

  union SignUpResult = Viewer | UserInputErrors | DatabaseError

  union ResendVerificationEmailResult = Viewer | DatabaseError

  union VerifyEmailResult = Viewer | DatabaseError | AuthenticationError

  union LogInResult =
      Viewer
    | UserInputErrors
    | AuthenticationError
    | DatabaseError

  type Mutation {
    signUp(input: SignUpInput!): SignUpResult!
    resendVerificationEmail(email: String!): ResendVerificationEmailResult!
    verifyEmail(token: String!): VerifyEmailResult!
    logIn(input: LogInInput): LogInResult!
    logOut: Viewer!
  }
`;
