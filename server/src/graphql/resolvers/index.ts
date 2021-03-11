import merge from "lodash.merge";
import { viewerResolvers } from "./Viewer";
import { miscResolvers } from "./Misc";
import { scalarResolvers } from "./Scalars";
import { userResolvers } from "./User";
import { listingResolvers } from "./Listing";
import { bookingResolvers } from "./Booking";

export const resolvers = merge(
  scalarResolvers,
  viewerResolvers,
  userResolvers,
  listingResolvers,
  bookingResolvers,
  miscResolvers
);
