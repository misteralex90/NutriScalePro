import {
  ACCOUNT_STATUS,
  PLAN,
  PROMOTION_TYPE,
  REFERRAL_STATUS,
  REQUEST_STATUS,
  ROLES,
  SCHEMA_VERSION,
} from './constants.js';
import { FOOD_DATABASE } from './foodDatabase.js';
import { computeSubscriptionDates } from './subscriptions.js';
import { nowIso, uid } from './utils.js';

export const seedState = () => {
  const createdAt = nowIso();
  const tenantId = uid('tenant');
  const sampleSubDates = computeSubscriptionDates(PLAN.MONTH_1, new Date());

  return {
    version: SCHEMA_VERSION,
    users: [
      {
        id: uid('user'),
        role: ROLES.MASTER,
        email: 'dr.dursi.nutritrain@gmail.com',
        password: 'Dioinme90',
        name: 'MASTER',
      },
      {
        id: uid('user'),
        role: ROLES.NUTRITIONIST,
        tenantId,
        email: 'demo@nutriscale.app',
        password: 'Demo123!',
        name: 'Dott. Mario Rossi',
      },
    ],
    tenants: [
      {
        id: tenantId,
        slug: 'mario-rossi',
        displayName: 'Dott. Mario Rossi',
        logoUrl: '/logo.png',
        logoFilename: 'logo.png',
        isBlocked: false,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
        createdAt,
      },
    ],
    subscriptions: [
      {
        id: uid('sub'),
        tenantId,
        plan: PLAN.MONTH_1,
        status: 'active',
        startAt: sampleSubDates.startAt,
        endAt: sampleSubDates.endAt,
        renewalUrl: '',
        updatedAt: createdAt,
      },
    ],
    promotions: [
      {
        id: uid('promo'),
        type: PROMOTION_TYPE.LIMITED_SLOTS_DISCOUNT,
        active: true,
        maxDiscountedUsers: 20,
        discountedJoinedCount: 3,
        slotsVisible: 10,
        createdAt,
      },
      {
        id: uid('promo'),
        type: PROMOTION_TYPE.FREE_MONTH_REFERRAL,
        active: true,
        createdAt,
      },
    ],
    referrals: [
      {
        id: uid('ref'),
        tenantId,
        firstName: 'Luca',
        lastName: 'Verdi',
        email: 'luca@example.com',
        status: REFERRAL_STATUS.INVITED,
        createdAt,
      },
    ],
    announcements: [
      {
        id: uid('msg'),
        title: 'Benvenuto in NutriScale SaaS',
        body: 'Da oggi puoi condividere il tuo link pubblico personale ai pazienti.',
        active: true,
        createdAt,
      },
    ],
    subscriptionRequests: [
      {
        id: uid('req'),
        tenantId,
        plan: PLAN.MONTH_12,
        status: REQUEST_STATUS.PENDING,
        billing: {
          firstName: 'Mario',
          lastName: 'Rossi',
          company: '',
          taxCodeOrVat: 'RSSMRA80A01H501Z',
          address: 'Via Roma 1, Milano',
          country: 'IT',
          contactEmail: 'demo@nutriscale.app',
          pecEmail: '',
          sdiCode: '',
        },
        paymentLink: '',
        notes: 'Richiesta upgrade annuale',
        createdAt,
        updatedAt: createdAt,
      },
    ],
    notifications: [],
    emailOutbox: [],
    auditLog: [],
    signupRateLimit: {},
    foodDatabase: FOOD_DATABASE,
    publicRateLimit: {},
  };
};

export const migrateState = (state) => {
  const seeded = seedState();
  const masterSeed = seeded.users.find((u) => u.role === ROLES.MASTER);

  // Ensure master credentials are always current
  const users = (state.users ?? seeded.users).map((u) =>
    u.role === ROLES.MASTER
      ? { ...u, email: masterSeed.email, password: masterSeed.password }
      : u
  );

  // Backfill accountStatus on tenants that lack it
  const tenants = (state.tenants ?? seeded.tenants).map((t) => ({
    ...t,
    accountStatus: t.accountStatus ?? ACCOUNT_STATUS.ACTIVE,
  }));

  return {
    ...seeded,
    ...state,
    users,
    tenants,
    version: SCHEMA_VERSION,
    foodDatabase: state.foodDatabase?.length ? state.foodDatabase : seeded.foodDatabase,
    publicRateLimit: state.publicRateLimit ?? {},
    emailOutbox: state.emailOutbox ?? [],
    auditLog: state.auditLog ?? [],
    signupRateLimit: state.signupRateLimit ?? {},
  };
};
