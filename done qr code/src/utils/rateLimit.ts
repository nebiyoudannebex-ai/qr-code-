import rateLimit from 'express-rate-limit';

const createRateLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: message },
    statusCode: 429,
  });

export const loginRateLimiter = createRateLimiter(
  60 * 1000,
  5,
  'Too many login attempts. Please wait a minute before trying again.'
);

export const adminRouteRateLimiter = createRateLimiter(
  60 * 1000,
  10,
  'Too many requests. Please slow down and try again shortly.'
);
