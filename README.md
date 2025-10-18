# Travel Planning GraphQL API

A GraphQL API that helps users plan trips by providing city search, weather forecasts, and activity recommendations.

## Features

- Search cities by name
- Get weather forecasts (1-16 days)
- Get activity rankings based on weather:
  - Skiing
  - Surfing
  - Indoor Sightseeing
  - Outdoor Sightseeing

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:4000` for the GraphiQL interface.

### Example Query

```graphql
query {
  searchCities(query: "London", limit: 5) {
    name
    country
    activityRankings(days: 7) {
      activity
      score
    }
  }
}
```

## Architecture Overview

### Structure

```
src/
├── services/
│   ├── geocode.ts        # City search
│   ├── weather.ts        # Weather data
│   └── activity.ts       # Activity scoring
├── schema/
│   └── index.ts          # GraphQL schema
├── types/
│   └── models.ts         # Type definitions
└── index.ts              # Server setup
```

### Key Decisions

**Service Layer Pattern**: Separated concerns into three services (geocoding, weather, activities). Each service handles one thing, making the code easier to test and maintain.

**Pure Functions for Scoring**: Activity ranking uses simple functions instead of classes. Less code, easier to understand.

**GraphQL Nested Resolvers**: Weather and activities are fields on the city object, so clients only fetch what they need.

**Simple Scoring Algorithm**: Activities are scored 0-100 based on temperature, precipitation, and weather conditions. Straightforward and predictable.

## Omitted and Reason of Omission

**Caching**: External APIs are fast enough for now. Would add Redis caching if usage increases.

**Authentication**: Not needed for this use case. Would add JWT auth if storing user data.

**Tests**: Focused on working implementation first. Would add unit tests for activity scoring logic next.

**Rate Limiting**: Relying on external API limits. Would add express-rate-limit for production.

**Retry Logic**: Kept error handling simple. Client can retry if needed.

**Advanced Scoring**: Used weighted scoring based on weather conditions. Could use ML for personalization later.

## Improvements

### Next Steps (Priority Order)

**1. Add Caching (Biggest Impact)**
- Cache weather data for 6 hours
- Would reduce API calls by ~95%
- Use simple in-memory cache or Redis

**2. Add Tests**
- Unit tests for activity scoring functions
- Mock external APIs in tests
- Validate edge cases (extreme weather, missing data)

**3. Better Error Handling**
- Add retry logic for transient failures
- Return partial results if one service fails
- More descriptive error messages for clients

**4. Rate Limiting**
- Limit requests per IP
- Prevent API quota exhaustion

### Future Enhancements

**More Sophisticated Scoring**
- Factor in time of year (winter = better skiing)
- Add more weather variables (wind, humidity)
- User preference weighting

**Additional Features**
- More activities (hiking, photography, beaches)
- Multi-day itinerary planning
- Compare multiple destinations
- Best time to visit recommendations

**Performance**
- Parallelize API calls where possible
- Add DataLoader to prevent N+1 queries
- Compress responses

## Technical Stack

- **Node.js + TypeScript**: Type safety and modern JS features
- **GraphQL**: Flexible querying, no over-fetching
- **Express**: Simple, widely used
- **Open-Meteo API**: Free weather and geocoding data

