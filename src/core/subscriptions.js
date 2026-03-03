import { PLAN } from './constants.js';
import { addDays, addMonths, daysUntil } from './utils.js';

export const computeSubscriptionDates = (plan, startAt = new Date()) => {
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) {
    throw new Error('Data di inizio non valida');
  }

  if (plan === PLAN.TRIAL_14) {
    return { startAt: start.toISOString(), endAt: addDays(start, 14).toISOString() };
  }
  if (plan === PLAN.MONTH_1) {
    return { startAt: start.toISOString(), endAt: addMonths(start, 1).toISOString() };
  }
  if (plan === PLAN.MONTH_12) {
    return { startAt: start.toISOString(), endAt: addMonths(start, 12).toISOString() };
  }

  throw new Error('Piano non supportato');
};

export const isSubscriptionActive = (subscription, now = new Date()) => {
  if (!subscription || subscription.status !== 'active') return false;
  return new Date(subscription.endAt).getTime() > now.getTime();
};

export const getExpiryNoticeDays = (subscription, now = new Date()) => {
  if (!subscription || subscription.status !== 'active') return null;
  const remainingDays = daysUntil(subscription.endAt, now);
  if (remainingDays === 10 || remainingDays === 5) return remainingDays;
  return null;
};

export const extendSubscriptionByMonths = (subscription, months, now = new Date()) => {
  const base = isSubscriptionActive(subscription, now) ? new Date(subscription.endAt) : now;
  return {
    ...subscription,
    endAt: addMonths(base, months).toISOString(),
    status: 'active',
    updatedAt: now.toISOString(),
  };
};
