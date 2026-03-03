import test from 'node:test';
import assert from 'node:assert/strict';
import { canAccessTenant } from '../src/core/rbac.js';
import { ROLES } from '../src/core/constants.js';

test('master can access any tenant', () => {
  const masterSession = { role: ROLES.MASTER };
  assert.equal(canAccessTenant(masterSession, 'tenant_a'), true);
  assert.equal(canAccessTenant(masterSession, 'tenant_b'), true);
});

test('nutritionist can only access own tenant', () => {
  const session = { role: ROLES.NUTRITIONIST, tenantId: 'tenant_a' };
  assert.equal(canAccessTenant(session, 'tenant_a'), true);
  assert.equal(canAccessTenant(session, 'tenant_b'), false);
});
