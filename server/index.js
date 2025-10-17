import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull, GraphQLInt } from 'graphql';
import { ruruHTML } from "ruru/server";
import { CityType, cities } from "./types/index.js";

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    city: {
      type: CityType,
      args : {
        id : { type: new GraphQLNonNull(GraphQLInt)}
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
 
const root = {
  hello() {
    return "Hello world!";
  },
};
 
const app = express();
 
app.all(
  "/graphql",
  createHandler({
    schema,
    rootValue: root,
  })
);

app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

const PORT = 4000;
 
app.listen(4000, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
    console.log(`GraphiQL IDE available at http://localhost:${PORT}/`);
});