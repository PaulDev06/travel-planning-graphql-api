import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenMeteoGeoCodingService } from '../../services/geocode.js';
import { GeoCodingError } from '../../types/models.js';

describe('Geocoding Service - Unit Tests', () => {
  let service: OpenMeteoGeoCodingService;

  beforeEach(() => {
    service = new OpenMeteoGeoCodingService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Input Validation', () => {
    it('should return empty array for empty query string', async () => {
      const result = await service.searchCities('');
      expect(result).toEqual([]);
    });

    it('should return empty array for whitespace-only query', async () => {
      const results = await Promise.all([
        service.searchCities('   '),
        service.searchCities('\t'),
        service.searchCities('\n')
      ]);
      
      results.forEach(result => {
        expect(result).toEqual([]);
      });
    });

    it('should trim and process valid query strings', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] })
      } as Response);

      await service.searchCities('  London  ');

      expect(fetchSpy).toHaveBeenCalled();
    });
  });

  describe('API Integration', () => {
    it('should construct correct API URL with all parameters', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] })
      } as Response);

      await service.searchCities('London', 5);

      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('geocoding-api.open-meteo.com/v1/search');
      expect(calledUrl).toContain('name=London');
      expect(calledUrl).toContain('count=5');
      expect(calledUrl).toContain('language=en');
      expect(calledUrl).toContain('format=json');
    });

    it('should use default limit of 10 if not provided', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] })
      } as Response);

      await service.searchCities('London');

      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('count=10');
    });

    it('should set correct request headers', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] })
      } as Response);

      await service.searchCities('London');

      const fetchOptions = fetchSpy.mock.calls[0][1];
      expect(fetchOptions?.headers).toMatchObject({
        'Accept': 'application/json',
        'User-Agent': 'TravelPlanner/1.0'
      });
    });

    it('should parse city results correctly', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 2643743,
              name: 'London',
              latitude: 51.50853,
              longitude: -0.12574,
              country: 'United Kingdom',
              admin1: 'England',
              population: 9000000
            },
            {
              id: 6058560,
              name: 'London',
              latitude: 42.9834,
              longitude: -81.2497,
              country: 'Canada',
              admin1: 'Ontario',
              population: 383822
            }
          ]
        })
      } as Response);

      const result = await service.searchCities('London', 2);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 2643743,
        name: 'London',
        latitude: 51.50853,
        longitude: -0.12574,
        country: 'United Kingdom',
        admin1: 'England',
        population: 9000000
      });
      expect(result[1].country).toBe('Canada');
    });

    it('should return empty array when API returns no results', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({})
      } as Response);

      const result = await service.searchCities('XYZ999NonexistentCity');

      expect(result).toEqual([]);
    });

    it('should handle partial city data gracefully', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 1,
              name: 'SmallTown',
              latitude: 50.0,
              longitude: 10.0
              // Missing country, admin1, population
            }
          ]
        })
      } as Response);

      const result = await service.searchCities('SmallTown');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('SmallTown');
      expect(result[0].country).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw GeoCodingError when API returns error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          error: { message: 'Invalid query parameter' }
        })
      } as Response);

      await expect(
        service.searchCities('London')
      ).rejects.toThrow(GeoCodingError);

      await expect(
        service.searchCities('London')
      ).rejects.toThrow('API error: Invalid query parameter');
    });

    it('should throw GeoCodingError on HTTP error response', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(
        service.searchCities('London')
      ).rejects.toThrow(GeoCodingError);

      await expect(
        service.searchCities('London')
      ).rejects.toThrow('Geocoding API returned 500');
    });

    it('should wrap network errors in GeoCodingError', async () => {
      vi.spyOn(global, 'fetch').mockRejectedValue(
        new Error('ETIMEDOUT')
      );

      await expect(
        service.searchCities('London')
      ).rejects.toThrow(GeoCodingError);

      await expect(
        service.searchCities('London')
      ).rejects.toThrow('Failed to fetch cities');
    });

    it('should preserve error cause in GeoCodingError', async () => {
      const originalError = new Error('Network failure');
      vi.spyOn(global, 'fetch').mockRejectedValue(originalError);

      try {
        await service.searchCities('London');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(GeoCodingError);
        expect((error as GeoCodingError).cause).toBeDefined();
      }
    });

    it('should handle abort/timeout gracefully', async () => {
      vi.spyOn(global, 'fetch').mockImplementation(() => {
        const controller = new AbortController();
        controller.abort();
        return Promise.reject(new Error('Request aborted'));
      });

      await expect(
        service.searchCities('London')
      ).rejects.toThrow(GeoCodingError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in query', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] })
      } as Response);

      await service.searchCities('São Paulo');

      expect(fetchSpy).toHaveBeenCalled();
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('name=S%C3%A3o+Paulo');
    });

    it('should handle very long city names', async () => {
      const longName = 'A'.repeat(200);
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] })
      } as Response);

      await service.searchCities(longName);

      expect(fetchSpy).toHaveBeenCalled();
    });

    it('should handle numeric-only queries', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] })
      } as Response);

      await service.searchCities('12345');

      expect(fetchSpy).toHaveBeenCalled();
    });
  });
});