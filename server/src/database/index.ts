import { Collection, MongoClient } from "mongodb";
import {
  BookingDocument,
  EmailVerificationDocument,
  ListingDocument,
  UserDocument,
  UserIdentityDocument,
} from "../lib/types";
// import { Database } from '../lib/types';
import { getBookingsCollection } from "./Booking";
import { getEmailVerificationsCollection } from "./EmailVerification";
import { getListingsCollection } from "./Listing";
import { getUsersCollection } from "./User";
import { getUserIdentitiesCollection } from "./UserIdentity";

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_USER_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

export interface Database {
  bookings: Collection<BookingDocument>;
  listings: Collection<ListingDocument>;
  users: Collection<UserDocument>;
  userIdentities: Collection<UserIdentityDocument>;
  emailVerifications: Collection<EmailVerificationDocument>;
}

export const connectDatabase = async (): Promise<Database> => {
  const client = await MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = client.db(); // if no name provided, use the dbName from the connection string

  const [users, userIdentities, emailVerifications] = await Promise.all([
    getUsersCollection(db),
    getUserIdentitiesCollection(db),
    getEmailVerificationsCollection(db),
  ]);

  return {
    users,
    userIdentities,
    emailVerifications,
    listings: getListingsCollection(db),
    bookings: getBookingsCollection(db),
  };
};
