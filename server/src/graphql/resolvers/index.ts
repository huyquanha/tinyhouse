import merge from "lodash.merge";
import { viewerResolvers } from "./Viewer";
import { miscResolvers } from "./Misc";
import { scalarResolvers } from "./Scalars";

export const resolvers = merge(scalarResolvers, viewerResolvers, miscResolvers);
