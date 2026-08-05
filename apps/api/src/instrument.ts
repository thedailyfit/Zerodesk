import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || 'https://ecaff25fceef3b3a02d076b972f054da@o4511857996660736.ingest.us.sentry.io/4511858004983808',
  tracesSampleRate: 1.0,
});
