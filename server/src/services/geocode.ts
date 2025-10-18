import { GeoCity, GeoCodingError, GeoCodingService } from '../types/models.js';

type OpenMeteoResponse = {
  results?: GeoCity[];
  error?: {
    message: string;
  };
}

export class OpenMeteoGeoCodingService implements GeoCodingService {
  private readonly baseUrl = 'https://geocoding-api.open-meteo.com/v1/search';

  async searchCities(query: string, limit: number = 10): Promise<GeoCity[]> {
    if (!query.trim()) return [];

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('name', query);
      url.searchParams.set('count', limit.toString());
      url.searchParams.set('language', 'en');
      url.searchParams.set('format', 'json');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TravelPlanner/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new GeoCodingError(
          `Geocoding API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json() as OpenMeteoResponse;
      
      if (data.error) {
        throw new GeoCodingError(`API error: ${data.error.message}`);
      }
      
      return data.results || [];

    } catch (error) {
      if (error instanceof GeoCodingError) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new GeoCodingError(
        `Failed to fetch cities: ${errorMessage}`,
        error
      );
    }
  }
}

export const geoCodingService = new OpenMeteoGeoCodingService();