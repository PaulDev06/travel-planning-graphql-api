import { describe, it, expect } from 'vitest';
import { rankActivities } from '../../services/activity.js';
import { DailyForecast, ActivityRanking } from '../../types/models.js';


describe('Activity Ranking Service - Unit Tests', () => {
  describe('rankActivities', () => {
    it('should return 4 activities with default scores for empty forecast', () => {
      const rankings = rankActivities([]);
      
      expect(rankings).toHaveLength(4);
      expect(rankings.every(r => r.score === 50)).toBe(true);
      expect(rankings.map(r => r.activity)).toContain('SKIING');
      expect(rankings.map(r => r.activity)).toContain('SURFING');
      expect(rankings.map(r => r.activity)).toContain('INDOOR_SIGHTSEEING');
      expect(rankings.map(r => r.activity)).toContain('OUTDOOR_SIGHTSEEING');
    });

    it('should rank skiing highest in cold, snowy conditions', () => {
      const forecasts: DailyForecast[] = [
        { date: '2025-01-01', temperatureMax: -5, temperatureMin: -10, precipitation: 10, weatherCode: 71 },
        { date: '2025-01-02', temperatureMax: -3, temperatureMin: -8, precipitation: 15, weatherCode: 73 },
        { date: '2025-01-03', temperatureMax: -2, temperatureMin: -7, precipitation: 8, weatherCode: 75 }
      ];

      const rankings = rankActivities(forecasts);
      
      expect(rankings[0].activity).toBe('SKIING');
      expect(rankings[0].score).toBeGreaterThan(80);
    });

    it('should rank surfing highly in warm, clear conditions', () => {
      const forecasts: DailyForecast[] = [
        { date: '2025-06-01', temperatureMax: 25, temperatureMin: 20, precipitation: 0, weatherCode: 0 },
        { date: '2025-06-02', temperatureMax: 26, temperatureMin: 21, precipitation: 1, weatherCode: 1 },
        { date: '2025-06-03', temperatureMax: 24, temperatureMin: 19, precipitation: 0, weatherCode: 0 }
      ];

      const rankings = rankActivities(forecasts);
      
      const surfing = rankings.find(r => r.activity === 'SURFING');
      expect(surfing?.score).toBeGreaterThan(80);
    });

    it('should rank indoor sightseeing highly in rainy, extreme temperature conditions', () => {
      const forecasts: DailyForecast[] = [
        { date: '2025-03-01', temperatureMax: 2, temperatureMin: -2, precipitation: 20, weatherCode: 61 },
        { date: '2025-03-02', temperatureMax: 1, temperatureMin: -3, precipitation: 25, weatherCode: 63 },
        { date: '2025-03-03', temperatureMax: 3, temperatureMin: -1, precipitation: 18, weatherCode: 61 }
      ];

      const rankings = rankActivities(forecasts);
      
      const indoor = rankings.find(r => r.activity === 'INDOOR_SIGHTSEEING');
      expect(indoor?.score).toBeGreaterThan(70);
    });

    it('should rank outdoor sightseeing highly in pleasant, clear conditions', () => {
      const forecasts: DailyForecast[] = [
        { date: '2025-05-01', temperatureMax: 20, temperatureMin: 15, precipitation: 0, weatherCode: 1 },
        { date: '2025-05-02', temperatureMax: 22, temperatureMin: 16, precipitation: 1, weatherCode: 0 },
        { date: '2025-05-03', temperatureMax: 21, temperatureMin: 15, precipitation: 0, weatherCode: 1 }
      ];

      const rankings = rankActivities(forecasts);
      
      const outdoor = rankings.find(r => r.activity === 'OUTDOOR_SIGHTSEEING');
      expect(outdoor?.score).toBeGreaterThan(80);
    });

    it('should return activities sorted by score in descending order', () => {
      const forecasts: DailyForecast[] = [
        { date: '2025-05-01', temperatureMax: 20, temperatureMin: 15, precipitation: 0, weatherCode: 0 }
      ];

      const rankings = rankActivities(forecasts);
      
      for (let i = 0; i < rankings.length - 1; i++) {
        expect(rankings[i].score).toBeGreaterThanOrEqual(rankings[i + 1].score);
      }
    });

    it('should never exceed score of 100', () => {
      const perfectConditions: DailyForecast[] = [
        { date: '2025-01-01', temperatureMax: -15, temperatureMin: -25, precipitation: 20, weatherCode: 75 },
        { date: '2025-01-02', temperatureMax: -12, temperatureMin: -22, precipitation: 18, weatherCode: 75 },
        { date: '2025-01-03', temperatureMax: -10, temperatureMin: -20, precipitation: 15, weatherCode: 71 }
      ];

      const rankings = rankActivities(perfectConditions);
      
      rankings.forEach(ranking => {
        expect(ranking.score).toBeLessThanOrEqual(100);
        expect(ranking.score).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle mixed weather conditions appropriately', () => {
      const forecasts: DailyForecast[] = [
        { date: '2025-04-01', temperatureMax: 18, temperatureMin: 12, precipitation: 5, weatherCode: 2 },
        { date: '2025-04-02', temperatureMax: 15, temperatureMin: 10, precipitation: 10, weatherCode: 61 },
        { date: '2025-04-03', temperatureMax: 20, temperatureMin: 14, precipitation: 2, weatherCode: 1 }
      ];

      const rankings = rankActivities(forecasts);
      
      expect(rankings).toHaveLength(4);
      // In moderate conditions, no extreme scores
      rankings.forEach((ranking: ActivityRanking) => {
        expect(ranking.score).toBeGreaterThanOrEqual(20);
        expect(ranking.score).toBeLessThanOrEqual(90);
      });
    });

    it('should handle single day forecast', () => {
      const forecasts: DailyForecast[] = [
        { date: '2025-05-01', temperatureMax: 22, temperatureMin: 16, precipitation: 0, weatherCode: 0 }
      ];

      const rankings = rankActivities(forecasts);
      
      expect(rankings).toHaveLength(4);
      expect(rankings.every(r => r.score >= 0 && r.score <= 100)).toBe(true);
    });
  });
});