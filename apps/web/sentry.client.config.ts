import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://4ce28a1a6c865a5772d12d531f5a175e@o4511857996668736.ingest.us.sentry.io/4511858846285952",
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
