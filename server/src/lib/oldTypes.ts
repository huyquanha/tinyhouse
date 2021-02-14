// import { Collection, ObjectId } from 'mongodb';

// export interface Booking {
//   _id: ObjectId;
//   listing: ObjectId;
//   tenant: ObjectId; // id of the person who made the booking
//   checkIn: string;
//   checkOut: string;
// }

// export enum ListingType {
//   APARTMENT = 'APARTMENT',
//   HOUSE = 'HOUSE',
// }

// export enum Provider {
//   GOOGLE = 'GOOGLE',
//   FACEBOOK = 'FACEBOOK',
// }

// export interface BookingsIndexMonth {
//   [key: string]: boolean; // key will be the day of month. true if the date has been booked
// }

// export interface BookingsIndexYear {
//   [key: string]: BookingsIndexMonth; // key will be the month of the year
// }

// export interface BookingsIndex {
//   [key: string]: BookingsIndexYear; // key will be the year
// }

// export interface Listing {
//   _id: ObjectId;
//   title: string;
//   description: string;
//   image: string;
//   host: ObjectId;
//   type: ListingType;
//   address: string;
//   country: string;
//   admin: string; // similar to states or provinces
//   city: string;
//   bookings: ObjectId[]; // bookings made against this listing
//   bookingsIndex: BookingsIndex; // store the dates the listing have been booked as nested key-value pairs
//   price: number;
//   numOfGuests: number; // maximum number of guests
// }

// export enum UserStatus {
//   ACTIVE = 'active',
//   PENDING = 'pending',
// }

// export interface User {
//   _id: ObjectId; // global unique identitifier for our user account
//   status: UserStatus;
//   token?: string;
//   name: string;
//   avatar?: string;
//   contact: string;
//   walletId?: string;
//   income: number;
//   bookings: ObjectId[]; // the bookings user has made
//   listings: ObjectId[]; // the listings user posted
//   identities: ObjectId[];
// }

// // each user can have multiple identities
// export interface UserIdentity {
//   _id: ObjectId; // global unique identitifier for each identity
//   userGuid: ObjectId; // global unique identifier for user, linked to User collection
//   email?: string;
//   password?: string;
//   provider?: Provider;
//   userId?: string; // user ID as provided by the provider (Google, Facebook...)
// }

// export interface EmailVerification {
//   _id: ObjectId; // same as User _id
//   token: string; // randomly generated token
//   createdAt: Date;
// }

// export interface Database {
//   bookings: Collection<Booking>;
//   listings: Collection<Listing>;
//   users: Collection<User>;
//   userIdentities: Collection<UserIdentity>;
//   emailVerifications: Collection<EmailVerification>;
// }

// export interface Viewer {
//   _id?: string;
//   status?: UserStatus;
//   contact?: string;
//   token?: string;
//   avatar?: string;
//   walletId?: string;
//   didRequest: boolean;
// }

// export interface ViewerEmail {
//   email?: string;
//   didRequest: boolean;
// }

// export interface UserInfo {
//   userId?: string;
//   name?: string;
//   avatar?: string;
//   contact?: string;
// }
