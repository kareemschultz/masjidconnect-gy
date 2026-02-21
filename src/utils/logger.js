const APP_TAG = '[MasjidConnect]';

function normalizeError(error) {
  if (!error) return 'Unknown error';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return JSON.stringify(error);
}

export function logWarn(scope, message, meta) {
  if (meta) {
    console.warn(`${APP_TAG} ${scope}: ${message}`, meta);
    return;
  }
  console.warn(`${APP_TAG} ${scope}: ${message}`);
}

export function logError(scope, error, meta) {
  const message = normalizeError(error);
  if (meta) {
    console.error(`${APP_TAG} ${scope}: ${message}`, meta);
    return;
  }
  console.error(`${APP_TAG} ${scope}: ${message}`);
}
