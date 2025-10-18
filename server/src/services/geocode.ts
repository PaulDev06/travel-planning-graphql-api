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

  private async fetchWithRetry(url: string, retries = 2): Promise<any> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          timeout: 8000, // Increased timeout
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TravelPlanner/1.0'
          }
        });
        return response;
      } catch (error) {
        if (attempt === retries) throw error;
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('All retry attempts failed');
  }

  async searchCities(query: string, limit: number = 10): Promise<GeoCity[]> {
    if (!query.trim()) return [];

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('name', query);
      url.searchParams.set('count', limit.toString());
      url.searchParams.set('language', 'en');
      url.searchParams.set('format', 'json');

      const response = await this.fetchWithRetry(url.toString());
      const data = await response.json() as OpenMeteoResponse;
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
