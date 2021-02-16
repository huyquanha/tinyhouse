import { Collection, Db } from "mongodb";
import { BookingDocument } from "../lib/types";

export const getBookingsCollection = (db: Db): Collection<BookingDocument> =>
  db.collection<BookingDocument>("bookings");
