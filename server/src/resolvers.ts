import { geoCodingService } from './services/geocode.js';
import { weatherService } from './services/weather.js';
import { rankActivities } from './services/activity.js';

export const resolvers = {
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