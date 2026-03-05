/**
 * Public Store — Firebase Realtime Database sync for cross-device access.
 * Handles public converter pages AND user auth/data for cross-device login.
 */
import { ref, set, get } from 'firebase/database';
import { rtdb } from './firebase.js';
import { FOOD_DATABASE } from './foodDatabase.js';

/** Convert email to a safe Firebase key */
const emailToKey = (email) => email.toLowerCase().replace(/\./g, ',').replace(/@/g, '_at_');

/**
 * Sync tenant public data to RTDB.
 */
export const syncTenantPublic = async (tenant, subscription, foodDatabase) => {
  try {
    const isActive = subscription && subscription.status === 'active';
    const safeFoodDatabase = Array.isArray(foodDatabase) && foodDatabase.length
      ? foodDatabase
      : FOOD_DATABASE;
    const payload = {
      displayName: tenant.displayName,
      slug: tenant.slug,
      logoUrl: tenant.logoUrl || '/logo.png',
      isAccessActive: isActive && !tenant.isBlocked,
      renewalUrl: subscription?.renewalUrl || '',
      updatedAt: new Date().toISOString(),
    };
    await set(ref(rtdb, `tenants/${tenant.slug}`), payload);
    await set(ref(rtdb, 'foodDatabase'), safeFoodDatabase);
  } catch (err) {
    console.warn('[publicStore] sync failed:', err.message);
  }
};

/**
 * Sync user auth credentials + full tenant data to RTDB for cross-device login.
 */
export const syncUserAuth = async (user, tenant, subscription) => {
  try {
    const key = emailToKey(user.email);
    await set(ref(rtdb, `auth/${key}`), {
      password: user.password,
      role: user.role,
      userId: user.id,
      tenantId: user.tenantId || null,
      name: user.name,
    });
    if (tenant) {
      await set(ref(rtdb, `tenantFull/${tenant.id}`), {
        tenant,
        subscription: subscription || null,
      });
    }
  } catch (err) {
    console.warn('[publicStore] syncUserAuth failed:', err.message);
  }
};

/**
 * Try to authenticate a nutritionist via RTDB.
 * Returns { user, tenant, subscription } or null.
 */
export const remoteLoginNutritionist = async (email, password) => {
  try {
    const key = emailToKey(email);
    const snap = await get(ref(rtdb, `auth/${key}`));
    if (!snap.exists()) return null;
    const authData = snap.val();
    if (authData.password !== password || authData.role !== 'NUTRITIONIST') return null;

    // Fetch full tenant data
    const tenantSnap = await get(ref(rtdb, `tenantFull/${authData.tenantId}`));
    if (!tenantSnap.exists()) return null;
    const full = tenantSnap.val();

    return {
      user: {
        id: authData.userId,
        role: authData.role,
        tenantId: authData.tenantId,
        email,
        password,
        name: authData.name,
      },
      tenant: full.tenant,
      subscription: full.subscription,
    };
  } catch (err) {
    console.warn('[publicStore] remoteLogin failed:', err.message);
    return null;
  }
};

/**
 * Fetch tenant public data from RTDB for the converter page.
 */
export const fetchTenantPublic = async (slug) => {
  try {
    const tenantSnap = await get(ref(rtdb, `tenants/${slug}`));
    if (!tenantSnap.exists()) return null;
    const tenant = tenantSnap.val();

    const foodSnap = await get(ref(rtdb, 'foodDatabase'));
    const foodDatabase = foodSnap.exists() ? foodSnap.val() : [];
    const normalizedFoodDatabase = Array.isArray(foodDatabase)
      ? foodDatabase
      : Object.values(foodDatabase || {});
    const safeFoodDatabase = normalizedFoodDatabase.length
      ? normalizedFoodDatabase
      : FOOD_DATABASE;

    // Self-heal remote food DB when available but empty.
    if (!normalizedFoodDatabase.length) {
      set(ref(rtdb, 'foodDatabase'), FOOD_DATABASE).catch(() => {});
    }

    return {
      tenant: {
        displayName: tenant.displayName,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
      },
      isAccessActive: tenant.isAccessActive,
      foodDatabase: safeFoodDatabase,
      renewalUrl: tenant.renewalUrl || '',
      blockReason: '',
    };
  } catch (err) {
    console.warn('[publicStore] fetch failed:', err.message);
    return null;
  }
};
