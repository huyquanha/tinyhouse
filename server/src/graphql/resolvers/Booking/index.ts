import { ApolloError, IResolvers } from "apollo-server-express";
import { Booking, Database, Listing } from "../../../lib";

export const bookingResolvers: IResolvers = {
  Booking: {
    id: (booking: Booking): string => booking._id.toHexString(),
    listing: async (
      booking: Booking,
      _arg: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<Listing> => {
      const listing = await db.listings.findOne({ _id: booking.listing });
      if (!listing) {
        // this is an unexpected error, since every booking
        // should have a listing
        throw new ApolloError("Listing not found");
      }
      return listing;
    },
  },
};
