import { Collection, Db } from "mongodb";
import { Listing } from "../lib/types";

export const getListingsCollection = async (
  db: Db
): Promise<Collection<Listing>> => {
  const listingCollection = db.collection<Listing>("listings");
  await listingCollection.createIndex({
    price: 1,
    _id: 1,
  });
  return listingCollection;
};
