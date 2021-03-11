import { Collection, Db } from "mongodb";
import { EmailVerification } from "../lib/types";

export const getEmailVerificationsCollection = async (
  db: Db
): Promise<Collection<EmailVerification>> => {
  // create index on user's email
  const emailVerificationsCol = db.collection<EmailVerification>(
    "emailVerifications"
  );
  await emailVerificationsCol.createIndexes([
    {
      key: {
        token: 1,
      },
      unique: true,
    },
    {
      key: {
        createdAt: 1,
      },
      expireAfterSeconds: 24 * 60 * 60, // 1 day
    },
  ]);
  return emailVerificationsCol;
};
