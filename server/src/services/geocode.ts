import { GeoCity, GeoCodingError, GeoCodingService } from '../types/models.js';
import fetch from 'node-fetch';

type OpenMeteoResponse = {
  results?: GeoCity[];
  error?: {
    message: string;
  };
}

export class OpenMeteoGeoCodingService {
  private readonly baseUrl = 'https://geocoding-api.open-meteo.com/v1/search';

  async searchCities(query: string, limit: number = 10): Promise<GeoCity[]> {
    if (!query.trim()) {
      throw new GeoCodingError('Search query cannot be empty');
    }

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append('name', query);
      url.searchParams.append('count', limit.toString());
      url.searchParams.append('language', 'en');
      url.searchParams.append('format', 'json');

      const response = await fetch(url.toString(), { timeout: 5000 });
      
      if (!response.ok) {
        throw new GeoCodingError(
          `OpenMeteo API request failed: ${response.statusText}`,
          { status: response.status }
        );
      }

      const data = await response.json() as OpenMeteoResponse;

      if (data.error) {
        throw new GeoCodingError(
          `OpenMeteo API error: ${data.error.message}`,
          data.error
        );
      }

      return data.results || [];

    } catch (error) {
      if (error instanceof GeoCodingError) {
        throw error;
      }
      throw new GeoCodingError(
        'Failed to fetch cities from OpenMeteo API',
        error
      );
    }
  }
}

export const geoCodingService = new OpenMeteoGeoCodingService();
