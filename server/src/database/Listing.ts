import { Collection, Db } from "mongodb";
import { ListingDocument } from "../lib/types";

export const getListingsCollection = (db: Db): Collection<ListingDocument> =>
  db.collection<ListingDocument>("listings");
