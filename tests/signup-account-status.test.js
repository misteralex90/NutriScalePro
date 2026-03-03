// Dati di fatturazione validi per i test
const validBilling = {
  firstName: 'Mario',
  lastName: 'Rossi',
  address: 'Via Roma 1',
  city: 'Roma',
  province: 'RM',
  country: 'IT',
  contactEmail: 'studio@example.com',
  cap: '00100',
  taxCodeOrVat: 'RSSMRA80A01H501U',
};
import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCOUNT_STATUS, ROLES, PLAN } from '../src/core/constants.js';
import { isSubscriptionActive } from '../src/core/subscriptions.js';
import { slugify, isValidDoctorDisplayName, normalizeEmail } from '../src/core/utils.js';

/* ────────────────────────────────────────────────────────────
   Mock localStorage so api.js / storage.js can run in Node
   ──────────────────────────────────────────────────────────── */
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};

// Dynamic imports after localStorage shim is in place
const { seedState } = await import('../src/core/migrations.js');
const { authApi, signupApi, masterApi, publicApi } = await import('../src/core/api.js');
const { loadState, saveState } = await import('../src/core/storage.js');

/* Helper: reset state to clean seed */
const resetState = () => {
  storage.clear();
  const seeded = seedState();
  saveState(seeded);
  return seeded;
};

/* Helper: create a master session */
const masterSession = () => ({ role: ROLES.MASTER, userId: 'user_master' });

/* ============================================================
   ACCOUNT_STATUS enum
   ============================================================ */
test('ACCOUNT_STATUS has all expected keys', () => {
  const keys = Object.keys(ACCOUNT_STATUS);
  assert.ok(keys.includes('PENDING_APPROVAL'));
  assert.ok(keys.includes('APPROVED_NO_SUBSCRIPTION'));
  assert.ok(keys.includes('ACTIVE'));
  assert.ok(keys.includes('EXPIRED'));
  assert.ok(keys.includes('SUSPENDED'));
  assert.ok(keys.includes('REJECTED'));
  assert.equal(keys.length, 9);
  assert.ok(keys.includes('TRIAL_ACTIVE'));
  assert.ok(keys.includes('ACTIVE_PAID'));
  assert.ok(keys.includes('PAYMENT_REQUIRED'));
  assert.equal(keys.length, 9);
});

/* ============================================================
   Display name validation (signup prerequisite)
   ============================================================ */
test('valid display name accepted', () => {
  assert.ok(isValidDoctorDisplayName('Dott. Mario Rossi'));
  assert.ok(isValidDoctorDisplayName('Dott. Anna Maria Bianchi'));
});

test('invalid display name rejected', () => {
  assert.equal(isValidDoctorDisplayName('Mario Rossi'), false);
  assert.equal(isValidDoctorDisplayName('Dott.MarioRossi'), false);
  assert.equal(isValidDoctorDisplayName(''), false);
});

/* ============================================================
   Email normalisation
   ============================================================ */
test('email normalisation lowercases and trims', () => {
  assert.equal(normalizeEmail('  User@Example.COM  '), 'user@example.com');
});

/* ============================================================
   Slug generation
   ============================================================ */
test('slugify generates url-safe slug', () => {
  assert.equal(slugify('Mario Rossi'), 'mario-rossi');
  assert.equal(slugify('Dott.  Maria Verdi'), 'dott-maria-verdi');
});

/* ============================================================
   Signup flow (integration)
   ============================================================ */
test('registerNutritionist creates PENDING_APPROVAL tenant', () => {
  resetState();
  const result = signupApi.registerNutritionist({
    email: 'new@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Nuovo Test',
    billing: validBilling,
  });
  assert.ok(result.ok);

  const state = loadState();
  const user = state.users.find((u) => u.email === 'new@test.com');
  assert.ok(user);
  const tenant = state.tenants.find((t) => t.id === user.tenantId);
  assert.equal(tenant.accountStatus, ACCOUNT_STATUS.PENDING_APPROVAL);
});

test('PENDING_APPROVAL account cannot login', () => {
  resetState();
  signupApi.registerNutritionist({
    email: 'pending@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Pending Test',
    billing: validBilling,
  });
    assert.throws(
      () => authApi.loginNutritionist({ email: 'pending@test.com', password: 'Passw0rd!' }),
      /attesa di approvazione/
    );
});

test('duplicate email signup throws', () => {
  resetState();
  signupApi.registerNutritionist({
    email: 'dup@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Dup Test',
    billing: validBilling,
  });
  assert.throws(
    () =>
      signupApi.registerNutritionist({
        email: 'dup@test.com',
        password: 'Passw0rd!',
        displayName: 'Dott. Dup Doppione',
        billing: validBilling,
      }),
    /già registrata/
  );
});

test('signup with short password throws', () => {
  resetState();
  assert.throws(
    () =>
      signupApi.registerNutritionist({
        email: 'short@test.com',
        password: '123',
        displayName: 'Dott. Short Test',
      }),
    /almeno 6 caratteri/
  );
});

test('signup with invalid display name throws', () => {
  resetState();
  assert.throws(
    () =>
      signupApi.registerNutritionist({
        email: 'bad@test.com',
        password: 'Passw0rd!',
        displayName: 'Mario Rossi',
      }),
    /Dott\. Nome Cognome/
  );
});

/* ============================================================
   Master approve signup
   ============================================================ */
test('approveSignup transitions to APPROVED_NO_SUBSCRIPTION', () => {
  resetState();
  signupApi.registerNutritionist({
    email: 'approve@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Approve Test',
    billing: validBilling,
  });

  const state = loadState();
  const user = state.users.find((u) => u.email === 'approve@test.com');
  const tenantId = user.tenantId;

  masterApi.approveSignup(masterSession(), tenantId);

  const after = loadState();
  const tenant = after.tenants.find((t) => t.id === tenantId);
  assert.equal(tenant.accountStatus, ACCOUNT_STATUS.ACTIVE);
});

test('approved account can login with APPROVED_NO_SUBSCRIPTION status', () => {
  resetState();
  signupApi.registerNutritionist({
    email: 'login-approved@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Login Approved',
    billing: validBilling,
  });

  const s0 = loadState();
  const u = s0.users.find((usr) => usr.email === 'login-approved@test.com');
  masterApi.approveSignup(masterSession(), u.tenantId);

  const session = authApi.loginNutritionist({
    email: 'login-approved@test.com',
    password: 'Passw0rd!',
  });
  assert.equal(session.accountStatus, ACCOUNT_STATUS.ACTIVE);
});

/* ============================================================
   Master reject signup
   ============================================================ */
test('rejectSignup transitions to REJECTED', () => {
  resetState();
  signupApi.registerNutritionist({
    email: 'reject@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Reject Test',
    billing: validBilling,
  });

  const state = loadState();
  const user = state.users.find((u) => u.email === 'reject@test.com');
  const tenantId = user.tenantId;

  masterApi.rejectSignup(masterSession(), tenantId, 'Non ammissibile');

  const after = loadState();
  const tenant = after.tenants.find((t) => t.id === tenantId);
  assert.equal(tenant.accountStatus, ACCOUNT_STATUS.REJECTED);
});

test('REJECTED account cannot login', () => {
  resetState();
  signupApi.registerNutritionist({
    email: 'rejected-login@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Rejected Login',
    billing: validBilling,
  });

  const s0 = loadState();
  const u = s0.users.find((usr) => usr.email === 'rejected-login@test.com');
  masterApi.rejectSignup(masterSession(), u.tenantId);

  assert.throws(
    () => authApi.loginNutritionist({ email: 'rejected-login@test.com', password: 'Passw0rd!' }),
    /rifiutata/
  );
});

/* ============================================================
   Master activate subscription
   ============================================================ */
test('activateSubscription transitions to ACTIVE', () => {
  resetState();
  signupApi.registerNutritionist({
    email: 'activate@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Activate Test',
    billing: validBilling,
  });

  const s0 = loadState();
  const u = s0.users.find((usr) => usr.email === 'activate@test.com');
  masterApi.approveSignup(masterSession(), u.tenantId);
  masterApi.activateSubscription(masterSession(), u.tenantId, PLAN.TRIAL_14);

  const session = authApi.loginNutritionist({
    email: 'activate@test.com',
    password: 'Passw0rd!',
  });
  assert.equal(session.accountStatus, ACCOUNT_STATUS.ACTIVE);
});

test('cannot activate subscription for PENDING_APPROVAL tenant', () => {
  resetState();
  signupApi.registerNutritionist({
    email: 'noact@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Noact Test',
    billing: validBilling,
  });

  const s0 = loadState();
  const u = s0.users.find((usr) => usr.email === 'noact@test.com');

  assert.throws(
    () => masterApi.activateSubscription(masterSession(), u.tenantId, PLAN.TRIAL_14),
    /non è in uno stato/
  );
});

/* ============================================================
   Audit log tracks events
   ============================================================ */
test('audit log records signup and approve events', () => {
  resetState();
  signupApi.registerNutritionist({
    email: 'audit@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Audit Test',
    billing: validBilling,
  });

  let state = loadState();
  const signupEntry = state.auditLog.find((e) => e.event === 'signup' && e.actor === 'audit@test.com');
  assert.ok(signupEntry, 'audit log should contain signup event');

  const u = state.users.find((usr) => usr.email === 'audit@test.com');
  masterApi.approveSignup(masterSession(), u.tenantId);

  state = loadState();
  const approveEntry = state.auditLog.find((e) => e.event === 'approve' && e.tenantId === u.tenantId);
  assert.ok(approveEntry, 'audit log should contain approve event');
});

/* ============================================================
   Public page gating on account status
   ============================================================ */
test('public page returns error for PENDING_APPROVAL tenant', () => {
  resetState();
  signupApi.registerNutritionist({
    email: 'publicgate@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Public Gate',
    billing: validBilling,
  });

  const s0 = loadState();
  const u = s0.users.find((usr) => usr.email === 'publicgate@test.com');
  const tenant = s0.tenants.find((t) => t.id === u.tenantId);

  assert.throws(
    () => publicApi.getTenantPage(tenant.slug),
    /non trovato/
  );
});

test('public page works for ACTIVE tenant (demo seed)', () => {
  resetState();
  // Demo account is seeded as ACTIVE — find slug from seed
  const state = loadState();
  const demoTenant = state.tenants.find((t) => t.accountStatus === ACCOUNT_STATUS.ACTIVE);
  assert.ok(demoTenant, 'seed should have an ACTIVE tenant');
  const result = publicApi.getTenantPage(demoTenant.slug);
  assert.ok(result.tenant);
  assert.equal(result.isAccessActive, true);
});

/* ============================================================
   Subscription expiry → status derives to EXPIRED
   ============================================================ */
test('isSubscriptionActive returns false for expired sub', () => {
  const sub = { status: 'active', endAt: '2024-01-01T00:00:00.000Z' };
  assert.equal(isSubscriptionActive(sub, new Date('2024-06-01T00:00:00.000Z')), false);
});

test('isSubscriptionActive returns true for valid sub', () => {
  const sub = { status: 'active', endAt: '2030-01-01T00:00:00.000Z' };
  assert.equal(isSubscriptionActive(sub, new Date('2026-01-01T00:00:00.000Z')), true);
});

/* ============================================================
   Full lifecycle: signup → approve → activate → login ACTIVE
   ============================================================ */
test('full lifecycle: signup → approve → activate → ACTIVE login', () => {
  resetState();

  // 1. Signup
  signupApi.registerNutritionist({
    email: 'lifecycle@test.com',
    password: 'Passw0rd!',
    displayName: 'Dott. Lifecycle Test',
    billing: validBilling,
  });

  // 2. Cannot login yet
  assert.throws(() =>
    authApi.loginNutritionist({ email: 'lifecycle@test.com', password: 'Passw0rd!' })
  );

  // 3. Approve
  const s1 = loadState();
  const u = s1.users.find((usr) => usr.email === 'lifecycle@test.com');
  masterApi.approveSignup(masterSession(), u.tenantId);

  // 4. Login returns ACTIVE (trial attivo)
  const sess1 = authApi.loginNutritionist({ email: 'lifecycle@test.com', password: 'Passw0rd!' });
  assert.equal(sess1.accountStatus, ACCOUNT_STATUS.ACTIVE);

  // 5. Activate trial
  masterApi.activateSubscription(masterSession(), u.tenantId, PLAN.TRIAL_14);

  // 6. Login returns ACTIVE
  const sess2 = authApi.loginNutritionist({ email: 'lifecycle@test.com', password: 'Passw0rd!' });
  assert.equal(sess2.accountStatus, ACCOUNT_STATUS.ACTIVE);

  // 7. Audit log has all events
  const state = loadState();
  const events = state.auditLog.filter(
    (e) => e.tenantId === u.tenantId || e.actor === 'lifecycle@test.com'
  );
  const eventTypes = events.map((e) => e.event);
  assert.ok(eventTypes.includes('signup'));
  assert.ok(eventTypes.includes('approve'));
  assert.ok(eventTypes.includes('activate_trial'));
});
