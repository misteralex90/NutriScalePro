import test from 'node:test';
import assert from 'node:assert/strict';
import { isSubscriptionActive } from '../src/core/subscriptions.js';

test('public access allowed for active subscription', () => {
  const sub = { status: 'active', endAt: '2026-03-10T00:00:00.000Z' };
  assert.equal(isSubscriptionActive(sub, new Date('2026-03-01T00:00:00.000Z')), true);
});

test('public access denied for expired subscription', () => {
  const sub = { status: 'active', endAt: '2026-03-10T00:00:00.000Z' };
  assert.equal(isSubscriptionActive(sub, new Date('2026-03-11T00:00:00.000Z')), false);
});
