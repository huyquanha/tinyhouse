import { Collection, Db } from "mongodb";
import { Listing } from "../lib/types";

export const getListingsCollection = (db: Db): Collection<Listing> =>
  db.collection<Listing>("listings");
