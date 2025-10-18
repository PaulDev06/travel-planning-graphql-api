import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLFloat } from 'graphql';

// Simple in-project City type (sample data)
export type City = {
  id: number;
  name: string;
}

export const CityType = new GraphQLObjectType({
  name: 'City',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  }
});

export const cities: City[] = [
  { id: 1, name: 'New York' },
  { id: 2, name: 'Los Angeles' },
  { id: 3, name: 'Chicago' },
];

// Geocoding-related types exposed to the schema
export type GeoCity = {
  id?: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  population?: number;
}

export const GeoCityType = new GraphQLObjectType({
  name: 'GeoCity',
  fields: {
    id: { type: GraphQLInt },
    name: { type: new GraphQLNonNull(GraphQLString) },
    country: { type: GraphQLString },
    admin1: { type: GraphQLString },
    latitude: { type: new GraphQLNonNull(GraphQLFloat) },
    longitude: { type: new GraphQLNonNull(GraphQLFloat) },
    population: { type: GraphQLInt },
  }
});