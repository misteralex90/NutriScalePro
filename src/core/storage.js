import { SCHEMA_VERSION, STORAGE_KEY } from './constants.js';
import { migrateState, seedState } from './migrations.js';

const readRaw = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const loadState = () => {
  const current = readRaw();
  if (!current) {
    const seeded = seedState();
    saveState(seeded);
    return seeded;
  }
  if ((current.version ?? 0) < SCHEMA_VERSION) {
    const migrated = migrateState(current);
    saveState(migrated);
    return migrated;
  }
  return current;
};

export const saveState = (value) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
};
