import { sanitizeTelemetry } from '@zerodesk/shared';
import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: false,
  beforeSend: sanitizeTelemetry,
  beforeSendTransaction: sanitizeTelemetry,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
