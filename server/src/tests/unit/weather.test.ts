import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenMeteoWeatherService } from '../../services/weather.js';
import { WeatherError } from '../../types/models.js';


describe('Weather Service - Unit Tests', () => {
  let service: OpenMeteoWeatherService;

  beforeEach(() => {
    service = new OpenMeteoWeatherService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Input Validation', () => {
    it('should reject days less than 1', async () => {
      const location = { latitude: 51.5074, longitude: -0.1278 };
      
      await expect(
        service.getWeatherForecast(location, 0)
      ).rejects.toThrow(WeatherError);
      
      await expect(
        service.getWeatherForecast(location, -5)
      ).rejects.toThrow('Forecast days must be between 1 and 16');
    });

    it('should reject days greater than 16', async () => {
      const location = { latitude: 51.5074, longitude: -0.1278 };
      
      await expect(
        service.getWeatherForecast(location, 17)
      ).rejects.toThrow(WeatherError);
      
      await expect(
        service.getWeatherForecast(location, 100)
      ).rejects.toThrow('Forecast days must be between 1 and 16');
    });

    it('should reject invalid latitude values', async () => {
      const invalidLocations = [
        { latitude: 91, longitude: 0 },
        { latitude: -91, longitude: 0 },
        { latitude: NaN, longitude: 0 }
      ];

      for (const location of invalidLocations) {
        await expect(
          service.getWeatherForecast(location, 7)
        ).rejects.toThrow('Invalid coordinates provided');
      }
    });

    it('should reject invalid longitude values', async () => {
      const invalidLocations = [
        { latitude: 0, longitude: 181 },
        { latitude: 0, longitude: -181 },
        { latitude: 0, longitude: NaN }
      ];

      for (const location of invalidLocations) {
        await expect(
          service.getWeatherForecast(location, 7)
        ).rejects.toThrow('Invalid coordinates provided');
      }
    });

    it('should accept boundary coordinate values', async () => {
      const validLocations = [
        { latitude: 90, longitude: 180 },
        { latitude: -90, longitude: -180 },
        { latitude: 0, longitude: 0 }
      ];

      const mockResponse = {
        ok: true,
        json: async () => ({
          daily: {
            time: ['2025-01-01'],
            temperature_2m_max: [10],
            temperature_2m_min: [5],
            precipitation_sum: [0],
            weathercode: [0]
          }
        })
      };

      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse as Response);

      for (const location of validLocations) {
        await expect(
          service.getWeatherForecast(location, 1)
        ).resolves.toBeDefined();
      }
    });
  });

  describe('API Integration', () => {
    it('should format coordinates to 4 decimal places in URL', async () => {
      const location = { latitude: 51.507351234, longitude: -0.127758567 };
      
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          daily: {
            time: ['2025-01-01'],
            temperature_2m_max: [10],
            temperature_2m_min: [5],
            precipitation_sum: [0],
            weathercode: [0]
          }
        })
      } as Response);

      await service.getWeatherForecast(location, 1);
      
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('latitude=51.5074');
      expect(calledUrl).toContain('longitude=-0.1278');
    });

    it('should include all required query parameters', async () => {
      const location = { latitude: 51.5074, longitude: -0.1278 };
      
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          daily: {
            time: ['2025-01-01'],
            temperature_2m_max: [10],
            temperature_2m_min: [5],
            precipitation_sum: [0],
            weathercode: [0]
          }
        })
      } as Response);

      await service.getWeatherForecast(location, 3);
      
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      expect(calledUrl).toContain('daily=temperature_2m_max');
      expect(calledUrl).toContain('temperature_2m_min');
      expect(calledUrl).toContain('precipitation_sum');
      expect(calledUrl).toContain('weathercode');
      expect(calledUrl).toContain('timezone=auto');
      expect(calledUrl).toContain('forecast_days=3');
    });

    it('should parse successful API response correctly', async () => {
      const location = { latitude: 51.5074, longitude: -0.1278 };
      
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          daily: {
            time: ['2025-01-01', '2025-01-02', '2025-01-03'],
            temperature_2m_max: [15, 16, 14],
            temperature_2m_min: [8, 9, 7],
            precipitation_sum: [0, 2.5, 5],
            weathercode: [0, 1, 61]
          }
        })
      } as Response);

      const result = await service.getWeatherForecast(location, 3);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: '2025-01-01',
        temperatureMax: 15,
        temperatureMin: 8,
        precipitation: 0,
        weatherCode: 0
      });
      expect(result[2]).toEqual({
        date: '2025-01-03',
        temperatureMax: 14,
        temperatureMin: 7,
        precipitation: 5,
        weatherCode: 61
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw WeatherError when API returns error object', async () => {
      const location = { latitude: 51.5074, longitude: -0.1278 };
      
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
          error: { message: 'Invalid parameters provided' }
        })
      } as Response);

      await expect(
        service.getWeatherForecast(location, 7)
      ).rejects.toThrow(WeatherError);
      
      await expect(
        service.getWeatherForecast(location, 7)
      ).rejects.toThrow('OpenMeteo API error: Invalid parameters provided');
    });

    it('should throw WeatherError when HTTP response is not ok', async () => {
      const location = { latitude: 51.5074, longitude: -0.1278 };
      
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      await expect(
        service.getWeatherForecast(location, 7)
      ).rejects.toThrow(WeatherError);
      
      await expect(
        service.getWeatherForecast(location, 7)
      ).rejects.toThrow('OpenMeteo API request failed');
    });

    it('should throw WeatherError when no forecast data is returned', async () => {
      const location = { latitude: 51.5074, longitude: -0.1278 };
      
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({})
      } as Response);

      await expect(
        service.getWeatherForecast(location, 7)
      ).rejects.toThrow('No forecast data available');
    });

    it('should wrap network errors in WeatherError', async () => {
      const location = { latitude: 51.5074, longitude: -0.1278 };
      
      vi.spyOn(global, 'fetch').mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(
        service.getWeatherForecast(location, 7)
      ).rejects.toThrow(WeatherError);
      
      await expect(
        service.getWeatherForecast(location, 7)
      ).rejects.toThrow('Failed to fetch weather forecast');
    });

    it('should preserve WeatherError instances through error chain', async () => {
      const location = { latitude: 51.5074, longitude: -0.1278 };
      
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      try {
        await service.getWeatherForecast(location, 7);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(WeatherError);
        expect((error as WeatherError).name).toBe('WeatherError');
      }
    });
  });
});