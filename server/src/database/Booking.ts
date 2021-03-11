import { Collection, Db } from "mongodb";
import { Booking } from "../lib/types";

export const getBookingsCollection = async (
  db: Db
): Promise<Collection<Booking>> => {
  const collection = db.collection<Booking>("bookings");
  await collection.createIndex({
    tenant: 1,
  });
  return collection;
};
