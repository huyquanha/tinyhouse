import { Listing, DatabaseError, ListingsFilter } from "../../../lib";

export interface ListingArgs {
  readonly id: string;
}

export interface ListingBookingsArgs {
  readonly lastId?: string;
  readonly limit: number;
}

export interface ListingsInput extends ListingBookingsArgs {
  readonly filter: ListingsFilter;
  readonly lastPrice?: number;
}

export interface ListingsArgs {
  readonly input: ListingsInput;
}

export type ListingResult = Listing | DatabaseError;
