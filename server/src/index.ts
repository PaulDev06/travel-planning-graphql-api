import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLInt } from 'graphql';
import { ruruHTML } from "ruru/server";
import { CityType, cities } from './types';  

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    city: {
      type: CityType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve: (parent, args) => {
        return cities.find(city => city.id === args.id);
      }
    },
    cities: {
      type: new GraphQLList(CityType),
      resolve: () => cities
    }
  }
});

const schema = new GraphQLSchema({ query: Query });

const app = express();

app.all(
  "/graphql",
  createHandler({
    schema,
  })
);

app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
    console.log(`GraphiQL IDE available at http://localhost:${PORT}/`);
});