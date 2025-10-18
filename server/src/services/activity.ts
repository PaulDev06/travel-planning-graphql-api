import { ActivityRanking, DailyForecast } from '../types/models.js';

export function rankActivities(forecasts: DailyForecast[]): ActivityRanking[] {
  if (!forecasts.length) {
    return [
      { activity: 'SKIING', score: 50 },
      { activity: 'SURFING', score: 50 },
      { activity: 'INDOOR_SIGHTSEEING', score: 50 },
      { activity: 'OUTDOOR_SIGHTSEEING', score: 50 }
    ];
  }

  const avgTemp = forecasts.reduce((sum, f) => 
    sum + (f.temperatureMax + f.temperatureMin) / 2, 0) / forecasts.length;
  
  const avgPrecip = forecasts.reduce((sum, f) => 
    sum + f.precipitation, 0) / forecasts.length;
  
  const hasSnow = forecasts.some(f => f.weatherCode >= 71 && f.weatherCode <= 77);
  
  const clearDays = forecasts.filter(f => f.weatherCode <= 2).length;
  const clearRatio = clearDays / forecasts.length;

  const rankings = [
    { activity: 'SKIING', score: calculateSkiingScore(avgTemp, avgPrecip, hasSnow) },
    { activity: 'SURFING', score: calculateSurfingScore(avgTemp, avgPrecip, clearRatio) },
    { activity: 'INDOOR_SIGHTSEEING', score: calculateIndoorScore(avgTemp, avgPrecip) },
    { activity: 'OUTDOOR_SIGHTSEEING', score: calculateOutdoorScore(avgTemp, avgPrecip, clearRatio) }
  ];

  return rankings.sort((a, b) => b.score - a.score);
}

function calculateSkiingScore(avgTemp: number, avgPrecip: number, hasSnow: boolean): number {
  let score = 0;
  
  if (avgTemp < -5) score += 40;
  else if (avgTemp < 0) score += 30;
  else if (avgTemp < 5) score += 15;
  
  if (hasSnow) score += 40;
  
  if (avgPrecip > 5 && avgPrecip < 20) score += 20;
  else if (avgPrecip >= 20) score += 10;
  
  return Math.min(100, score);
}

function calculateSurfingScore(avgTemp: number, avgPrecip: number, clearRatio: number): number {
  let score = 0;
  
  if (avgTemp >= 18 && avgTemp <= 28) score += 40;
  else if (avgTemp >= 15 && avgTemp < 18) score += 30;
  else if (avgTemp >= 12) score += 15;
  
  score += clearRatio * 30;
  
  if (avgPrecip < 5) score += 30;
  else if (avgPrecip < 10) score += 15;
  
  return Math.min(100, score);
}

function calculateIndoorScore(avgTemp: number, avgPrecip: number): number {
  let score = 50;
  
  if (avgPrecip > 10) score += 25;
  else if (avgPrecip > 5) score += 15;
  
  if (avgTemp < 0 || avgTemp > 32) score += 25;
  else if (avgTemp < 5 || avgTemp > 28) score += 10;
  
  return Math.min(100, score);
}

function calculateOutdoorScore(avgTemp: number, avgPrecip: number, clearRatio: number): number {
  let score = 0;
  
  if (avgTemp >= 15 && avgTemp <= 25) score += 40;
  else if (avgTemp >= 10 && avgTemp < 15) score += 25;
  else if (avgTemp >= 8 && avgTemp < 28) score += 15;
  
  score += clearRatio * 40;
  
  if (avgPrecip < 2) score += 20;
  else if (avgPrecip < 5) score += 10;
  
  return Math.min(100, score);
}