import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAN } from '../src/core/constants.js';
import { computeSubscriptionDates, extendSubscriptionByMonths, isSubscriptionActive } from '../src/core/subscriptions.js';

test('computeSubscriptionDates trial 14 days', () => {
  const { startAt, endAt } = computeSubscriptionDates(PLAN.TRIAL_14, '2026-01-01T00:00:00.000Z');
  assert.equal(startAt, '2026-01-01T00:00:00.000Z');
  assert.equal(endAt, '2026-01-15T00:00:00.000Z');
});

test('computeSubscriptionDates month and year', () => {
  const oneMonth = computeSubscriptionDates(PLAN.MONTH_1, '2026-01-10T00:00:00.000Z');
  const oneYear = computeSubscriptionDates(PLAN.MONTH_12, '2026-01-10T00:00:00.000Z');
  assert.equal(oneMonth.endAt, '2026-02-10T00:00:00.000Z');
  assert.equal(oneYear.endAt, '2027-01-10T00:00:00.000Z');
});

test('extendSubscriptionByMonths accumulates extension from active end date', () => {
  const sub = {
    status: 'active',
    startAt: '2026-01-01T00:00:00.000Z',
    endAt: '2026-02-01T00:00:00.000Z',
  };
  const extended = extendSubscriptionByMonths(sub, 1, new Date('2026-01-15T00:00:00.000Z'));
  assert.equal(extended.endAt, '2026-03-01T00:00:00.000Z');
});

test('isSubscriptionActive false when expired', () => {
  const sub = { status: 'active', endAt: '2026-01-01T00:00:00.000Z' };
  assert.equal(isSubscriptionActive(sub, new Date('2026-01-02T00:00:00.000Z')), false);
});
