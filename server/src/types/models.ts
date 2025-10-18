
export type City = {
  id: number;
  name: string;
}

export type GeoLocation = {
  latitude: number;
  longitude: number;
}

export type GeoCity = City & GeoLocation & {
  country?: string;
  admin1?: string;
  population?: number;
}


export type GeoCodingService = {
  searchCities(query: string, limit?: number): Promise<GeoCity[]>;
}


export class GeoCodingError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'GeoCodingError';
  }
}