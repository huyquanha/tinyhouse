import { Collection, Db } from "mongodb";
import { User } from "../lib/types";

export const getUsersCollection = async (db: Db): Promise<Collection<User>> => {
  // create index on user's email
  const usersCollection = db.collection<User>("users");
  await usersCollection.createIndex(
    {
      contact: 1,
    },
    {
      unique: true,
    }
  );
  return usersCollection;
};
