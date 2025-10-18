// Domain entities
export type City = {
  id: number;
  name: string;
}

export type GeoLocation = {
  latitude: number;
  longitude: number;
}

export type GeoCity = City & GeoLocation & {
  country?: string;
  admin1?: string;
  population?: number;
}

// Weather domain
export type WeatherCode = 
  | 0   // Clear sky
  | 1   // Mainly clear
  | 2   // Partly cloudy
  | 3   // Overcast
  | 45  // Foggy
  | 48  // Depositing rime fog
  | 51  // Light drizzle
  | 53  // Moderate drizzle
  | 55  // Dense drizzle
  | 61  // Slight rain
  | 63  // Moderate rain
  | 65  // Heavy rain
  | 71  // Slight snow fall
  | 73  // Moderate snow fall
  | 75  // Heavy snow fall
  | 77  // Snow grains
  | 80  // Slight rain showers
  | 81  // Moderate rain showers
  | 82  // Violent rain showers
  | 85  // Slight snow showers
  | 86  // Heavy snow showers
  | 95  // Thunderstorm
  | 96  // Thunderstorm with slight hail
  | 99; // Thunderstorm with heavy hail

export type DailyForecast = {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitation: number;
  weatherCode: WeatherCode;
}

// Activity domain
export enum ActivityType {
  SKIING = 'SKIING',
  SURFING = 'SURFING',
  INDOOR_SIGHTSEEING = 'INDOOR_SIGHTSEEING',
  OUTDOOR_SIGHTSEEING = 'OUTDOOR_SIGHTSEEING'
}

export type ActivityRanking = {
  activity: ActivityType;
  score: number;
  suitability: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}

// Service interfaces
export type WeatherService = {
  getWeatherForecast(location: GeoLocation, days?: number): Promise<DailyForecast[]>;
}

export type GeoCodingService = {
  searchCities(query: string, limit?: number): Promise<GeoCity[]>;
}

export type ActivityRankingService = {
  rankActivities(forecasts: DailyForecast[]): ActivityRanking[];
}

export class GeoCodingError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'GeoCodingError';
  }
}

export class WeatherError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'WeatherError';
  }
}