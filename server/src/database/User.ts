import { Collection, Db } from "mongodb";
import { UserDocument } from "../lib/types";

export const getUsersCollection = async (
  db: Db
): Promise<Collection<UserDocument>> => {
  // create index on user's email
  const usersCollection = db.collection<UserDocument>("users");
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
