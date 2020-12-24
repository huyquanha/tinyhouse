import { Collection, ObjectId } from 'mongodb';

export interface Booking {
  _id: ObjectId;
  listing: ObjectId;
  tenant: string; // id of the person who made the booking
  checkIn: string;
  checkOut: string;
}

export enum ListingType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
}

export interface BookingsIndexMonth {
  [key: string]: boolean; // key will be the day of month. true if the date has been booked
}

export interface BookingsIndexYear {
  [key: string]: BookingsIndexMonth; // key will be the month of the year
}

export interface BookingsIndex {
  [key: string]: BookingsIndexYear; // key will be the year
}

export interface Listing {
  _id: ObjectId;
  title: string;
  description: string;
  image: string;
  host: string;
  type: ListingType;
  address: string;
  country: string;
  admin: string; // similar to states or provinces
  city: string;
  bookings: ObjectId[]; // bookings made against this listing
  bookingsIndex: BookingsIndex; // store the dates the listing have been booked as nested key-value pairs
  price: number;
  numOfGuests: number; // maximum number of guests
}

export interface User {
  _id: string;
  token: string;
  name: string;
  avatar: string;
  contact: string;
  walletId?: string;
  income: number;
  bookings: ObjectId[]; // the bookings user has made
  listings: ObjectId[]; // the listings user posted
}

export interface Database {
  bookings: Collection<Booking>;
  listings: Collection<Listing>;
  users: Collection<User>;
}

export interface Viewer {
  _id?: string;
  token?: string;
  avatar?: string;
  walletId?: string;
  didRequest: boolean;
}
