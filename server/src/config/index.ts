// src/config/index.ts
type Config = {
  port: number;
  env: 'development' | 'production' | 'test';
  api: {
    timeout: number;
    weatherCacheTTL: number;
  };
};

export const config: Config = {
  port: parseInt(process.env.PORT || '4000', 10),
  env: (process.env.NODE_ENV || 'development') as Config['env'],
  api: {
    timeout: parseInt(process.env.API_TIMEOUT || '10000', 10),
    weatherCacheTTL: parseInt(process.env.WEATHER_CACHE_TTL || '3600', 10)
  }
};