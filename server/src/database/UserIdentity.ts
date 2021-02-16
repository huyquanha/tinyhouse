import { Collection, Db } from "mongodb";
import { UserIdentityDocument } from "../lib/types";

export const getUserIdentitiesCollection = async (
  db: Db
): Promise<Collection<UserIdentityDocument>> => {
  // create indices on userIdentities collection (only executed for indices that do not yet exist)
  const userIdentitiesCollection = db.collection<UserIdentityDocument>(
    "userIdentities"
  );
  await userIdentitiesCollection.createIndexes([
    {
      key: {
        "identity.provider": 1,
        "identity.userId": 1,
      },
      unique: true,
      // partial index https://docs.mongodb.com/manual/core/index-partial/#index-type-partial
      partialFilterExpression: {
        $and: [
          {
            "identity.provider": {
              $exists: true,
            },
          },
          {
            "identity.userId": {
              $exists: true,
            },
          },
        ],
      },
    },
    {
      key: {
        "identity.email": 1,
      },
      unique: true,
      partialFilterExpression: {
        "identity.email": {
          $exists: true,
        },
      },
    },
  ]);
  return userIdentitiesCollection;
};
