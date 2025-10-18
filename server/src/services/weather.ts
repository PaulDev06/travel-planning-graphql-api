import { WeatherService, DailyForecast, WeatherError, GeoLocation, WeatherCode } from '../types/models.js';

type OpenMeteoWeatherResponse = {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weathercode: number[];
  };
  error?: {
    message: string;
  };
}

export class OpenMeteoWeatherService implements WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast';

  private isValidLatitude(lat: number): boolean {
    return !isNaN(lat) && lat >= -90 && lat <= 90;
  }

  private isValidLongitude(lon: number): boolean {
    return !isNaN(lon) && lon >= -180 && lon <= 180;
  }

  async getWeatherForecast(location: GeoLocation, days: number = 7): Promise<DailyForecast[]> {
    if (days < 1 || days > 16) {
      throw new WeatherError('Forecast days must be between 1 and 16');
    }

    if (!this.isValidLatitude(location.latitude) || !this.isValidLongitude(location.longitude)) {
      throw new WeatherError('Invalid coordinates provided');
    }

    try {
      const url = new URL(this.baseUrl);
      url.searchParams.append('latitude', location.latitude.toFixed(4));
      url.searchParams.append('longitude', location.longitude.toFixed(4));
      url.searchParams.append('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode');
      url.searchParams.append('timezone', 'auto');
      url.searchParams.append('forecast_days', days.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new WeatherError(
          `OpenMeteo API request failed: ${response.statusText}`,
          { status: response.status }
        );
      }

      const data = await response.json() as OpenMeteoWeatherResponse;

      if (data.error) {
        throw new WeatherError(
          `OpenMeteo API error: ${data.error.message}`,
          data.error
        );
      }

      if (!data.daily) {
        throw new WeatherError('No forecast data available');
      }

      const { time, temperature_2m_max, temperature_2m_min, precipitation_sum, weathercode } = data.daily;

      return time.map((date, index) => ({
        date,
        temperatureMax: temperature_2m_max[index],
        temperatureMin: temperature_2m_min[index],
        precipitation: precipitation_sum[index],
        weatherCode: weathercode[index] as WeatherCode,
      }));

    } catch (error) {
      if (error instanceof WeatherError) {
        throw error;
      }
      throw new WeatherError(
        'Failed to fetch weather forecast',
        error
      );
    }
  }
}

export const weatherService = new OpenMeteoWeatherService();