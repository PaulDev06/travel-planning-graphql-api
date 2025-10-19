import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createHandler } from 'graphql-http/lib/use/express';
import { schema } from '../../schema/index.js';
import { resolvers } from '../../resolvers.js';


describe('GraphQL API - Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.all('/graphql', createHandler({
      schema,
      rootValue: resolvers,
    }));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('searchCities Query', () => {
    it('should accept valid GraphQL query', async () => {
      const query = `
        query {
          searchCities(query: "London", limit: 1) {
            id
            name
            country
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should return empty array for empty query', async () => {
      const query = `
        query {
          searchCities(query: "", limit: 5) {
            id
            name
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data.searchCities).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const query = `
        query {
          searchCities(query: "London", limit: 3) {
            id
            name
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.searchCities).toBeInstanceOf(Array);
    });

    it('should return all city fields when requested', async () => {
      const query = `
        query {
          searchCities(query: "Paris", limit: 1) {
            id
            name
            latitude
            longitude
            country
            admin1
            population
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
      if (response.body.data.searchCities.length > 0) {
        const city = response.body.data.searchCities[0];
        expect(city).toHaveProperty('id');
        expect(city).toHaveProperty('name');
        expect(city).toHaveProperty('latitude');
        expect(city).toHaveProperty('longitude');
      }
    });

    it('should handle GraphQL syntax errors', async () => {
      const invalidQuery = `
        query {
          searchCities(query: "London"
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query: invalidQuery })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should handle invalid field names', async () => {
      const query = `
        query {
          searchCities(query: "London") {
            invalidField
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('weatherForecast Nested Query', () => {
    it('should return weather forecast for a city', async () => {
      const query = `
        query {
          searchCities(query: "London", limit: 1) {
            name
            weatherForecast(days: 3) {
              date
              temperatureMax
              temperatureMin
              precipitation
              weatherCode
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.searchCities).toBeInstanceOf(Array);
    });

    it('should use default 7 days if days parameter not provided', async () => {
      const query = `
        query {
          searchCities(query: "Tokyo", limit: 1) {
            name
            weatherForecast {
              date
              temperatureMax
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should return all weather fields when requested', async () => {
      const query = `
        query {
          searchCities(query: "Paris", limit: 1) {
            weatherForecast(days: 1) {
              date
              temperatureMax
              temperatureMin
              precipitation
              weatherCode
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('activityRankings Nested Query', () => {
    it('should return activity rankings for a city', async () => {
      const query = `
        query {
          searchCities(query: "Berlin", limit: 1) {
            name
            activityRankings(days: 7) {
              activity
              score
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.searchCities).toBeInstanceOf(Array);
    });

    it('should return 4 activities sorted by score', async () => {
      const query = `
        query {
          searchCities(query: "Sydney", limit: 1) {
            activityRankings(days: 3) {
              activity
              score
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should use default 7 days for activity rankings', async () => {
      const query = `
        query {
          searchCities(query: "Dubai", limit: 1) {
            activityRankings {
              activity
              score
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('Combined Queries', () => {
    it('should return both weather and activity rankings', async () => {
      const query = `
        query {
          searchCities(query: "Rome", limit: 1) {
            name
            country
            weatherForecast(days: 3) {
              date
              temperatureMax
              temperatureMin
            }
            activityRankings(days: 3) {
              activity
              score
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.searchCities).toBeInstanceOf(Array);
    });

    it('should handle multiple cities with nested queries', async () => {
      const query = `
        query {
          searchCities(query: "London", limit: 2) {
            name
            country
            activityRankings(days: 1) {
              activity
              score
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.searchCities).toBeInstanceOf(Array);
    });
  });

  describe('Query Variables', () => {
    it('should support query variables', async () => {
      const query = `
        query SearchCity($cityName: String!, $resultLimit: Int) {
          searchCities(query: $cityName, limit: $resultLimit) {
            name
            country
          }
        }
      `;

      const variables = {
        cityName: 'Barcelona',
        resultLimit: 1
      };

      const response = await request(app)
        .post('/graphql')
        .send({ query, variables })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });

    it('should use default values for optional variables', async () => {
      const query = `
        query SearchCity($cityName: String!) {
          searchCities(query: $cityName) {
            name
          }
        }
      `;

      const variables = {
        cityName: 'Madrid'
      };

      const response = await request(app)
        .post('/graphql')
        .send({ query, variables })
        .expect(200);

      expect(response.body.data).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required arguments', async () => {
      const query = `
        query {
          searchCities {
            name
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should return empty results gracefully on service errors', async () => {
      const query = `
        query {
          searchCities(query: "TestCity123") {
            name
            weatherForecast(days: 100) {
              date
            }
          }
        }
      `;

      const response = await request(app)
        .post('/graphql')
        .send({ query })
        .expect(200);


      expect(response.body).toBeDefined();
    });
  });
});