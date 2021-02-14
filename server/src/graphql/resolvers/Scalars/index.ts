import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import { IResolvers } from 'apollo-server-express';

export const scalarResolvers: IResolvers = {
  Date: DateResolver,
  DateTime: DateTimeResolver,
};
