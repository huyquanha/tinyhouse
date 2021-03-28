import { UserStatus } from "./graphql/globalTypes";

export interface Viewer {
  id: string | null;
  status: UserStatus | null;
  contact: string | null;
  token: string | null;
  avatar: string | null;
  hasWallet: boolean | null;
  didRequest: boolean;
}

export interface BookingListingParams {
  lastId: string | null;
  fetchNext: boolean;
}

export enum AuthAction {
  LOG_IN = "Log in",
  SIGN_UP = "Sign up",
}
