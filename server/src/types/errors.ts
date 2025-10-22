// src/types/errors.ts
export enum ErrorCode {
  INVALID_COORDINATES = 'INVALID_COORDINATES',
  INVALID_DAYS = 'INVALID_DAYS',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode: number = 500,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Usage
throw new AppError(
  'Invalid coordinates provided',
  ErrorCode.INVALID_COORDINATES,
  400
);