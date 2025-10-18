import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { ruruHTML } from "ruru/server";
import { schema } from './schema/index.js';
import { geoCodingService } from './services/geocode.js';
import { GeoCodingError } from './types/models.js';

// Root resolver implementation
const root = {
  searchCities: async ({ query, limit }: { query: string; limit?: number }) => {
    try {
      return await geoCodingService.searchCities(query, limit);
    } catch (error) {
      if (error instanceof GeoCodingError) {
        // Log error details but don't expose internal error messages
        console.error('GeoCoding error:', error);
        return [];
      }
      throw error; // Let unexpected errors be handled by GraphQL error handling
    }
  }
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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/graphql`);
    console.log(`GraphiQL IDE available at http://localhost:${PORT}/`);
});