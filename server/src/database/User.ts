import { Db } from 'mongodb';
import { UserDocument } from '../lib/types';

export const getUsersCollection = async (db: Db) => {
  // create index on user's email
  const usersCollection = db.collection<UserDocument>('users');
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
