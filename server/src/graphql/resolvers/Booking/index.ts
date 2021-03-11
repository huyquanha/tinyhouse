import { IResolvers } from "apollo-server-express";
import { Booking, Database, Listing } from "../../../lib";

export const bookingResolvers: IResolvers = {
  Booking: {
    id: (booking: Booking): string => booking._id.toHexString(),
    listing: (
      booking: Booking,
      _arg: Record<string, unknown>,
      { db }: { db: Database }
    ): Promise<Listing | null> => db.listings.findOne({ _id: booking.listing }),
  },
};
