import { 
  ActivityRankingService, 
  ActivityRanking, 
  ActivityType, 
  DailyForecast,
  WeatherCode 
} from '../types/models.js';

type WeatherConditions = {
  avgTemp: number;
  avgPrecipitation: number;
  hasSnow: boolean;
  clearDays: number;
  totalDays: number;
}

export class WeatherBasedActivityRankingService implements ActivityRankingService {
  
  rankActivities(forecasts: DailyForecast[]): ActivityRanking[] {
    if (!forecasts || forecasts.length === 0) {
      return this.getDefaultRankings();
    }

    const conditions = this.analyzeWeatherConditions(forecasts);
    
    return [
      this.rankSkiing(conditions),
      this.rankSurfing(conditions),
      this.rankIndoorSightseeing(conditions),
      this.rankOutdoorSightseeing(conditions)
    ].sort((a, b) => b.score - a.score);
  }

  private analyzeWeatherConditions(forecasts: DailyForecast[]): WeatherConditions {
    const totalDays = forecasts.length;
    const avgTemp = forecasts.reduce((sum, f) => sum + (f.temperatureMax + f.temperatureMin) / 2, 0) / totalDays;
    const avgPrecipitation = forecasts.reduce((sum, f) => sum + f.precipitation, 0) / totalDays;
    const hasSnow = forecasts.some(f => this.isSnowWeather(f.weatherCode));
    const clearDays = forecasts.filter(f => this.isClearWeather(f.weatherCode)).length;

    return { avgTemp, avgPrecipitation, hasSnow, clearDays, totalDays };
  }

  private rankSkiing(conditions: WeatherConditions): ActivityRanking {
    let score = 0;

    // Cold temperature is essential
    if (conditions.avgTemp < -5) score += 40;
    else if (conditions.avgTemp < 0) score += 30;
    else if (conditions.avgTemp < 5) score += 15;
    else score += 0;

    // Snow presence is critical
    if (conditions.hasSnow) score += 40;

    // Some precipitation is good for fresh snow
    if (conditions.avgPrecipitation > 5 && conditions.avgPrecipitation < 20) score += 20;
    else if (conditions.avgPrecipitation >= 20) score += 10;

    return {
      activity: ActivityType.SKIING,
      score: Math.min(100, score),
      suitability: this.getSuitability(score)
    };
  }

  private rankSurfing(conditions: WeatherConditions): ActivityRanking {
    let score = 0;

    // Moderate to warm temperature
    if (conditions.avgTemp >= 18 && conditions.avgTemp <= 28) score += 40;
    else if (conditions.avgTemp >= 15 && conditions.avgTemp < 18) score += 30;
    else if (conditions.avgTemp >= 12) score += 15;

    // Clear weather is preferred
    const clearRatio = conditions.clearDays / conditions.totalDays;
    score += clearRatio * 30;

    // Light precipitation is okay
    if (conditions.avgPrecipitation < 5) score += 30;
    else if (conditions.avgPrecipitation < 10) score += 15;

    return {
      activity: ActivityType.SURFING,
      score: Math.min(100, score),
      suitability: this.getSuitability(score)
    };
  }

  private rankIndoorSightseeing(conditions: WeatherConditions): ActivityRanking {
    let score = 50; // Base score - always viable

    // Better when weather is bad outside
    if (conditions.avgPrecipitation > 10) score += 25;
    else if (conditions.avgPrecipitation > 5) score += 15;

    // Extreme temperatures make indoor better
    if (conditions.avgTemp < 0 || conditions.avgTemp > 32) score += 25;
    else if (conditions.avgTemp < 5 || conditions.avgTemp > 28) score += 10;

    return {
      activity: ActivityType.INDOOR_SIGHTSEEING,
      score: Math.min(100, score),
      suitability: this.getSuitability(score)
    };
  }

  private rankOutdoorSightseeing(conditions: WeatherConditions): ActivityRanking {
    let score = 0;

    // Pleasant temperature range
    if (conditions.avgTemp >= 15 && conditions.avgTemp <= 25) score += 40;
    else if (conditions.avgTemp >= 10 && conditions.avgTemp < 15) score += 25;
    else if (conditions.avgTemp >= 8 && conditions.avgTemp < 28) score += 15;

    // Clear days are important
    const clearRatio = conditions.clearDays / conditions.totalDays;
    score += clearRatio * 40;

    // Low precipitation is preferred
    if (conditions.avgPrecipitation < 2) score += 20;
    else if (conditions.avgPrecipitation < 5) score += 10;

    return {
      activity: ActivityType.OUTDOOR_SIGHTSEEING,
      score: Math.min(100, score),
      suitability: this.getSuitability(score)
    };
  }

  private isSnowWeather(code: WeatherCode): boolean {
    return code >= 71 && code <= 77 || code === 85 || code === 86;
  }

  private isClearWeather(code: WeatherCode): boolean {
    return code >= 0 && code <= 2;
  }

  private getSuitability(score: number): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    if (score >= 75) return 'EXCELLENT';
    if (score >= 55) return 'GOOD';
    if (score >= 35) return 'FAIR';
    return 'POOR';
  }

  private getDefaultRankings(): ActivityRanking[] {
    return Object.values(ActivityType).map(activity => ({
      activity,
      score: 50,
      suitability: 'FAIR' as const
    }));
  }
}

export const activityRankingService = new WeatherBasedActivityRankingService();