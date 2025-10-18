import { buildSchema } from 'graphql';
import { GeoCity } from '../types/models.js';

export const schema = buildSchema(`
  """
  Daily weather forecast information
  """
  type DailyForecast {
    """ISO date string (YYYY-MM-DD)"""
    date: String!
    """Maximum temperature in Celsius"""
    temperatureMax: Float!
    """Minimum temperature in Celsius"""
    temperatureMin: Float!
    """Total precipitation in millimeters"""
    precipitation: Float!
    """
    WMO Weather interpretation codes
    0: Clear sky
    1: Mainly clear
    2: Partly cloudy
    3: Overcast
    45: Foggy
    48: Depositing rime fog
    51-55: Drizzle
    61-65: Rain
    71-77: Snow
    80-82: Rain showers
    85-86: Snow showers
    95: Thunderstorm
    96-99: Thunderstorm with hail
    """
    weatherCode: Int!
  }

  """
  Activity types available for ranking
  """
  enum ActivityType {
    SKIING
    SURFING
    INDOOR_SIGHTSEEING
    OUTDOOR_SIGHTSEEING
  }

  """
  Suitability level for an activity
  """
  enum Suitability {
    EXCELLENT
    GOOD
    FAIR
    POOR
  }

  """
  Ranking information for a specific activity based on weather conditions
  """
  type ActivityRanking {
    """Type of activity"""
    activity: ActivityType!
    """Score from 0-100 indicating suitability"""
    score: Float!
    """Overall suitability rating"""
    suitability: Suitability!
  }

  """
  City information with geographic coordinates
  """
  type GeoCity {
    """Unique identifier for the city"""
    id: Int!
    """Name of the city"""
    name: String!
    """Latitude coordinate"""
    latitude: Float!
    """Longitude coordinate"""
    longitude: Float!
    """Country name"""
    country: String
    """Administrative region (state/province)"""
    admin1: String
    """City population"""
    population: Int
    """
    Weather forecast for the city.
    Defaults to 7 days if days parameter is not provided.
    """
    weatherForecast(days: Int = 7): [DailyForecast!]!
    """
    Activity rankings based on the weather forecast.
    Returns activities ranked by suitability (best first).
    """
    activityRankings(days: Int = 7): [ActivityRanking!]!
  }

  type Query {
    """
    Search for cities by name. Returns matching cities with their coordinates.
    """
    searchCities(
      """Search term for city name"""
      query: String!,
      """Maximum number of results to return"""
      limit: Int = 10
    ): [GeoCity!]!
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