import { IResolvers } from "apollo-server-express";
import { Listing } from "../../../lib";

export const listingResolvers: IResolvers = {
  Listing: {
    id: (listing: Listing): string => listing._id.toHexString(),
  },
};
