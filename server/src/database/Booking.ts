import { Db } from 'mongodb';
import { BookingDocument } from '../lib/types';

export const getBookingsCollection = (db: Db) =>
  db.collection<BookingDocument>('bookings');
