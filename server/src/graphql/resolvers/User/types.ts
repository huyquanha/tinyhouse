import { DatabaseError, User } from "../../../lib";

// inputs
export interface QueryUserArgs {
  readonly id: string;
}

export type ListingBookingsArgs = {
  readonly lastId?: string;
  readonly limit: number;
};

// reuslts
export type UserResult = User | DatabaseError;
