import { ApolloError, IResolvers } from "apollo-server-express";
import { ObjectId } from "mongodb";
import {
  Listing,
  Database,
  authorize,
  User,
  Booking,
  ListingsFilter,
} from "../../../lib";
import {
  ListingArgs,
  ListingResult,
  ListingBookingsArgs,
  ListingsArgs,
} from "./types";
import { Request } from "express";

export const listingResolvers: IResolvers = {
  Query: {
    listing: async (
      _root: undefined,
      { id }: ListingArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<ListingResult> => {
      try {
        const listing = await db.listings.findOne({ _id: new ObjectId(id) });
        if (!listing) {
          return {
            __typename: "DatabaseError",
            message: "Listing not found",
          };
        }
        const viewer = await authorize(db, req);
        listing.authorized = viewer?._id.equals(listing.host)
          ? true
          : undefined;
        return { ...listing, __typename: "Listing" };
      } catch (err) {
        throw new ApolloError(`Unexpected error when querying listing: ${err}`);
      }
    },
    listings: async (
      _root: undefined,
      { input: { filter, lastPrice, lastId, limit } }: ListingsArgs,
      { db }: { db: Database }
    ): Promise<Listing[]> => {
      try {
        const listingCursor = db.listings
          .find(
            (lastPrice || lastPrice === 0) && lastId
              ? {
                  $or: [
                    {
                      price: {
                        ...(filter === ListingsFilter.PRICE_LOW_TO_HIGH
                          ? limit > 0
                            ? { $gt: lastPrice }
                            : { $lt: lastPrice }
                          : limit > 0
                          ? { $lt: lastPrice }
                          : { $gt: lastPrice }),
                      },
                    },
                    {
                      $and: [
                        {
                          price: {
                            $eq: lastPrice,
                          },
                        },
                        {
                          _id: {
                            ...(filter === ListingsFilter.PRICE_LOW_TO_HIGH
                              ? limit > 0
                                ? { $gt: new ObjectId(lastId) }
                                : { $lt: new ObjectId(lastId) }
                              : limit > 0
                              ? { $lt: new ObjectId(lastId) }
                              : { $gt: new ObjectId(lastId) }),
                          },
                        },
                      ],
                    },
                  ],
                }
              : {}
          )
          // when limit > 0 (fetch next) we want to sort ascendingly by _id
          // when limit < 0 (fetch previous) we want to sort descendingly by _id,
          // so we grab ${limit} highest elements just before lastId instead of the first ${limit} elements
          .sort({
            price:
              filter === ListingsFilter.PRICE_LOW_TO_HIGH
                ? limit > 0
                  ? 1
                  : -1
                : limit > 0
                ? -1
                : 1,
            _id:
              filter === ListingsFilter.PRICE_LOW_TO_HIGH
                ? limit > 0
                  ? 1
                  : -1
                : limit > 0
                ? -1
                : 1,
          })
          .limit(Math.abs(limit));
        const listings = await listingCursor.toArray();
        // for limit < 0, the elements are reversely ordered because of the descending sort,
        // => we need to reverse them one more time here so they are returned to client in ascending order
        return limit > 0 ? listings : listings.reverse();
      } catch (err) {
        throw new ApolloError(
          `Unexpected error when querying listings: ${err}`
        );
      }
    },
  },
  Listing: {
    id: (listing: Listing): string => listing._id.toHexString(),
    host: async (
      listing: Listing,
      _args: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<User> => {
      const host = await db.users.findOne({ _id: listing.host });
      if (!host) {
        // this is an unexpected error, since every listing
        // should have a host
        throw new ApolloError("Host not found");
      }
      return host;
    },
    bookingsIndex: (listing: Listing): string =>
      JSON.stringify(listing.bookingsIndex),
    bookings: async (
      listing: Listing,
      { lastId, limit }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<Booking[] | null> => {
      try {
        if (!listing.authorized) {
          return null;
        }
        const bookingCursor = db.bookings
          .find({
            listing: listing._id,
            ...(lastId
              ? {
                  ...(limit > 0
                    ? { $gt: new ObjectId(lastId) }
                    : { $lt: new ObjectId(lastId) }),
                }
              : {}),
          })
          .sort({ _id: limit > 0 ? 1 : -1 })
          .limit(Math.abs(limit));
        const bookings = await bookingCursor.toArray();
        return limit > 0 ? bookings : bookings.reverse();
      } catch (err) {
        throw new ApolloError(
          `Unexpected error when querying listing's bookings: ${err}`
        );
      }
    },
  },
};
