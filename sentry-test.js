const Sentry = require('@sentry/node');

// Same DSN as the backend
Sentry.init({
  dsn: 'https://ecaff25fceef3b3a02d076b972f054da@o4511857996660736.ingest.us.sentry.io/4511858004983808',
  tracesSampleRate: 1.0,
});

console.log("Sending test error to Sentry...");

// Create an intentional error
const testError = new Error("Sentry Backend Test Error (Standalone)");

// Capture it
Sentry.captureException(testError);

// Close the connection so the script exits
Sentry.close(2000).then(() => {
  console.log("Error successfully sent to Sentry!");
});
