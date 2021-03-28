import { ApolloError, IResolvers } from "apollo-server-express";
import { Database, Booking, User, authorize, Listing } from "../../../lib";
import { UserResult, QueryUserArgs, ListingBookingsArgs } from "./types";
import { Request } from "express";
import { ObjectId } from "mongodb";

export const userResolvers: IResolvers = {
  Query: {
    user: async (
      _root: undefined,
      { id }: QueryUserArgs,
      { db, req }: { db: Database; req: Request }
    ): Promise<UserResult> => {
      try {
        const user = await db.users.findOne({ _id: new ObjectId(id) });
        if (!user) {
          return {
            __typename: "DatabaseError",
            message: "User not found",
          };
        }
        const viewer = await authorize(db, req);
        const authorized = viewer?._id.equals(user._id) ? true : undefined;
        return {
          ...user,
          __typename: "User",
          authorized,
        };
      } catch (err) {
        throw new ApolloError(`Failed to query user: ${err}`);
      }
    },
  },
  User: {
    id: (user: User): string => user._id.toHexString(),
    hasWallet: (user: User): boolean => !!user.walletId,
    income: (user: User): number | null =>
      user.authorized ? user.income : null,
    bookings: async (
      user: User,
      { lastId, limit }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<Booking[] | null> => {
      try {
        if (!user.authorized) {
          return null;
        }
        const bookingCursor = db.bookings
          .find({
            tenant: user._id,
            ...(lastId
              ? {
                  _id: {
                    ...(limit > 0
                      ? { $gt: new ObjectId(lastId) }
                      : { $lt: new ObjectId(lastId) }),
                  },
                }
              : {}),
          })
          .sort({
            _id: limit > 0 ? 1 : -1,
          })
          .limit(Math.abs(limit));
        const bookings = await bookingCursor.toArray();
        return limit > 0 ? bookings : bookings.reverse();
      } catch (err) {
        throw new ApolloError(
          `Unexpected error when querying user's bookings: ${err}`
        );
      }
    },
    listings: async (
      user: User,
      { lastId, limit }: ListingBookingsArgs,
      { db }: { db: Database }
    ): Promise<Listing[]> => {
      try {
        const listingCursor = db.listings
          .find({
            host: user._id,
            ...(lastId
              ? {
                  _id: {
                    ...(limit > 0
                      ? { $gt: new ObjectId(lastId) }
                      : { $lt: new ObjectId(lastId) }),
                  },
                }
              : {}),
          })
          // when limit > 0 (fetch next) we want to sort ascendingly by _id
          // when limit < 0 (fetch previous) we want to sort descendinly by _id,
          // so we grab ${limit} highest elements just before lastId instead of the first ${limit} elements
          .sort({
            _id: limit > 0 ? 1 : -1,
          })
          .limit(Math.abs(limit));
        const listings = await listingCursor.toArray();
        // for limit < 0, the elements are reversely ordered because of the descending sort,
        //  => we need to reverse them one more time here so they are returned to client in ascending order
        return limit > 0 ? listings : listings.reverse();
      } catch (err) {
        throw new ApolloError(
          `Unexpected error when querying user's listings: ${err}`
        );
      }
    },
  },
};
