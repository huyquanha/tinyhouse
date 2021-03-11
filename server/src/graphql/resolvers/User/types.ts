import { DatabaseError, User } from "../../../lib";

// inputs
export interface QueryUserArgs {
  readonly id: string;
}

export type ListingBookingsArgs = {
  lastId?: string;
  limit: number;
};

// reuslts
export type UserResult = User | DatabaseError;
