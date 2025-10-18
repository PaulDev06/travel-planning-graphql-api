import { buildSchema } from 'graphql';
import { GeoCity } from '../types/models.js';

export const schema = buildSchema(`
  type GeoCity {
    id: Int!
    name: String!
    latitude: Float!
    longitude: Float!
    country: String
    admin1: String
    population: Int
  }

  type Query {
    searchCities(query: String!, limit: Int): [GeoCity!]!
  }
`);

// Type definitions for resolver functions
export type Resolvers = {
  searchCities: (args: SearchCitiesArgs) => Promise<GeoCity[]>;
}

// Types for query arguments
export type SearchCitiesArgs = {
  query: string;
  limit?: number;
}