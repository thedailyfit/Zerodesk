// Keep operational location/type metadata; discard free-form application/customer payloads.
export function sanitizeTelemetry<T extends Record<string, any>>(event: T): T {
  for (const key of ['user','request','extra','breadcrumbs','contexts','tags','message','logentry','transaction','spans']) delete event[key];
  for (const exception of event.exception?.values || []) {
    exception.value = '[redacted]';
    for (const frame of exception.stacktrace?.frames || []) {
      for (const key of ['vars','pre_context','post_context','context_line','abs_path']) delete frame[key];
      if (frame.filename) frame.filename = String(frame.filename).split(/[?#]/)[0].split(/[\\/]/).pop();
    }
  }
  return event;
}
