import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Viewer {
    id: ID
    token: String
    avatar: String
    hasWallet: Boolean
    didRequest: Boolean!
  }

  enum Provider {
    GOOGLE
    FACEBOOK
  }

  input LogInInput {
    provider: Provider!
    code: String!
  }

  input AuthUrlInput {
    provider: Provider!
  }

  type Query {
    authUrl(input: AuthUrlInput!): String!
  }

  type Mutation {
    logIn(input: LogInInput): Viewer!
    logOut: Viewer!
  }
`;
