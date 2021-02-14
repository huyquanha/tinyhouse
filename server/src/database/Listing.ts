import { Db } from 'mongodb';
import { ListingDocument } from '../lib/types';

export const getListingsCollection = (db: Db) =>
  db.collection<ListingDocument>('listings');
