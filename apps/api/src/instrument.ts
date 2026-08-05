import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://4ce28a1a6c865a5772d12d531f5a175e@o4511857996668736.ingest.us.sentry.io/4511858846285952',
  tracesSampleRate: 1.0,
});
