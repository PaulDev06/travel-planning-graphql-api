import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import { ruruHTML } from "ruru/server";

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => 'Hello, GraphQL with Express!'
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