export const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;

export const nowIso = () => new Date().toISOString();

export const parseDate = (value) => new Date(value);

export const addDays = (value, days) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
};

export const addMonths = (value, months) => {
  const date = new Date(value);
  date.setMonth(date.getMonth() + months);
  return date;
};

export const daysUntil = (value, from = new Date()) => {
  const diff = parseDate(value).getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatDate = (value) => {
  if (!value) return '—';
  const d = parseDate(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(d);
};

export const sanitizeFilename = (name = 'logo') => name.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 80);

export const slugify = (value) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const isValidDoctorDisplayName = (value) => {
  if (!value) return false;
  const trimmed = value.trim();
  const regex = /^Dott\.\s+[A-Za-zÀ-ÖØ-öø-ÿ' -]+\s+[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
  return regex.test(trimmed);
};

export const assertDoctorDisplayName = (value) => {
  if (!isValidDoctorDisplayName(value)) {
    throw new Error('Il nome visualizzato deve essere nel formato: Dott. Nome Cognome');
  }
};

export const normalizeEmail = (value = '') => value.trim().toLowerCase();
