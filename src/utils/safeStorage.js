import { logWarn } from './logger';

/**
 * Safely read JSON from storage and return fallback on malformed payloads.
 * Optional validate callback can enforce the expected shape.
 */
export function readJsonStorage(key, fallback, validate = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    if (typeof validate === 'function' && !validate(parsed)) return fallback;
    return parsed;
  } catch (error) {
    logWarn('safeStorage.readJsonStorage', `Invalid localStorage payload for ${key}`, error);
    return fallback;
  }
}

export function writeJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    logWarn('safeStorage.writeJsonStorage', `Failed to write localStorage payload for ${key}`, error);
    return false;
  }
}

