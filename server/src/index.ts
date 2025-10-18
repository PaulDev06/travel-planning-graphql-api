import express from "express";
import { createHandler } from "graphql-http/lib/use/express";
import { ruruHTML } from "ruru/server";
import { schema } from './schema/index.js';
import { geoCodingService } from './services/geocode.js';
import { weatherService } from './services/weather.js';
import { rankActivities } from './services/activity.js';

const root = {
  searchCities: async ({ query, limit = 10 }: { query: string; limit?: number }) => {
    try {
      if (!query?.trim()) return [];
      
      const cities = await geoCodingService.searchCities(query, Math.min(Math.max(1, limit), 100));
      
      return cities.map(city => ({
        ...city,
        weatherForecast: async ({ days = 7 }) => {
          try {
            return await weatherService.getWeatherForecast(city, days);
          } catch (error) {
            console.error('Weather forecast error:', error);
            return [];
          }
        },
        activityRankings: async ({ days = 7 }) => {
          try {
            const forecasts = await weatherService.getWeatherForecast(city, days);
            return rankActivities(forecasts);
          } catch (error) {
            console.error('Activity ranking error:', error);
            return [];
          }
        }
      }));
    } catch (error) {
      console.error('City search error:', error);
      return [];
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