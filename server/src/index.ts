import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { ruruHTML } from "ruru/server";
import { schema } from './schema/index.js';
import { resolvers } from './resolvers.js';

const app = express();

app.all(
  "/graphql",
  createHandler({
    schema,
    rootValue: resolvers,
  })
);

app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`GraphiQL IDE available at http://localhost:${PORT}/`);
});