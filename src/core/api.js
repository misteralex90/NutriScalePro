import {
  ACCOUNT_STATUS,
  AUDIT_EVENT,
  BILLING_REQUIRED_FIELDS,
  LOGO_ALLOWED_TYPES,
  LOGO_MAX_SIZE_BYTES,
  PLAN,
  PLAN_LABELS,
  PLAN_PRICES,
  PROMOTION_TYPE,
  PUBLIC_RESERVED_SLUGS,
  REFERRAL_STATUS,
  REQUEST_STATUS,
  ROLES,
} from './constants.js';
import { canAccessTenant, assertRole } from './rbac.js';
import { runSchedulers } from './scheduler.js';
import { computeSubscriptionDates, extendSubscriptionByMonths, isSubscriptionActive } from './subscriptions.js';
import { loadState, saveState } from './storage.js';
import { sendEmail } from './emailGateway.js';
import { assertDoctorDisplayName, normalizeEmail, sanitizeFilename, slugify, uid, nowIso, addDays } from './utils.js';

const getState = () => runSchedulers(loadState());

const commit = (state) => {
  saveState(state);
  return state;
};

const getTenant = (state, tenantId) => state.tenants.find((tenant) => tenant.id === tenantId);
const getSubscriptionByTenant = (state, tenantId) => state.subscriptions.find((sub) => sub.tenantId === tenantId);

const getPromotion = (state, type) => state.promotions.find((promo) => promo.type === type && promo.active);

const checkPublicRateLimit = (state, slug) => {
  const bucket = state.publicRateLimit[slug] ?? { count: 0, from: Date.now() };
  const now = Date.now();
  const windowMs = 60_000;

  if (now - bucket.from > windowMs) {
    state.publicRateLimit[slug] = { count: 1, from: now };
    return state;
  }

  if (bucket.count >= 120) {
    throw new Error('Troppe richieste. Riprova tra poco.');
  }

  state.publicRateLimit[slug] = { ...bucket, count: bucket.count + 1 };
  return state;
};

const resolvePlanPrice = (state, plan) => {
  if (plan === PLAN.TRIAL_14) return 0;
  const slotsPromo = getPromotion(state, PROMOTION_TYPE.LIMITED_SLOTS_DISCOUNT);
  if (slotsPromo && slotsPromo.discountedJoinedCount < slotsPromo.maxDiscountedUsers) {
    return PLAN_PRICES.promoSlots[plan];
  }
  return PLAN_PRICES.standard[plan];
};

/* ── Audit log helper ──────────────────────────────────────── */
const appendAudit = (state, event, actor, meta = {}) => ({
  ...state,
  auditLog: [
    ...(state.auditLog ?? []),
    { id: uid('audit'), event, actor, ...meta, at: nowIso() },
  ],
});

/* ── Signup rate limiter (per IP-equivalent key) ───────────── */
const checkSignupRateLimit = (state) => {
  const key = '__global';
  const bucket = state.signupRateLimit?.[key] ?? { count: 0, from: Date.now() };
  const now = Date.now();
  const windowMs = 60_000 * 5; // 5 min window
  if (now - bucket.from > windowMs) {
    state.signupRateLimit = { ...state.signupRateLimit, [key]: { count: 1, from: now } };
    return state;
  }
  if (bucket.count >= 20) {
    throw new Error('Troppe richieste di registrazione. Riprova più tardi.');
  }
  state.signupRateLimit = { ...state.signupRateLimit, [key]: { ...bucket, count: bucket.count + 1 } };
  return state;
};

/* ── Derive account status from tenant + subscription ──────── */
const deriveAccountStatus = (tenant, subscription, now = new Date()) => {
  if (!tenant) return null;
  if (tenant.accountStatus === 'TRIAL_ACTIVE') {
    if (subscription && subscription.plan === 'trial_2' && subscription.status === 'active' && isSubscriptionActive(subscription, now)) {
      return ACCOUNT_STATUS.TRIAL_ACTIVE;
    } else {
      return ACCOUNT_STATUS.PAYMENT_REQUIRED;
    }
  }
  if (tenant.accountStatus === 'ACTIVE_PAID') {
    if (subscription && subscription.status === 'active' && isSubscriptionActive(subscription, now)) {
      return ACCOUNT_STATUS.ACTIVE_PAID;
    } else {
      return ACCOUNT_STATUS.PAYMENT_REQUIRED;
    }
  }
  if (tenant.accountStatus === ACCOUNT_STATUS.PENDING_APPROVAL) return ACCOUNT_STATUS.PENDING_APPROVAL;
  if (tenant.accountStatus === ACCOUNT_STATUS.REJECTED) return ACCOUNT_STATUS.REJECTED;
  if (tenant.accountStatus === ACCOUNT_STATUS.SUSPENDED || tenant.isBlocked) return ACCOUNT_STATUS.SUSPENDED;
  if (!subscription || subscription.status !== 'active') return ACCOUNT_STATUS.APPROVED_NO_SUBSCRIPTION;
  if (!isSubscriptionActive(subscription, now)) return ACCOUNT_STATUS.EXPIRED;
  return ACCOUNT_STATUS.ACTIVE;
};

/* ── Make slug unique ──────────────────────────────────────── */
const makeUniqueSlug = (state, base) => {
  let slug = base;
  let i = 1;
  while (
    PUBLIC_RESERVED_SLUGS.includes(slug) ||
    state.tenants.some((t) => t.slug === slug)
  ) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
};

export const authApi = {
  loginMaster: ({ email, password }) => {
    const state = getState();
    const user = state.users.find(
      (candidate) => candidate.role === ROLES.MASTER && candidate.email === normalizeEmail(email) && candidate.password === password
    );
    if (!user) throw new Error('Credenziali MASTER non valide');
    return { role: ROLES.MASTER, userId: user.id };
  },

  loginNutritionist: ({ email, password }) => {
    const state = getState();
    const user = state.users.find(
      (candidate) =>
        candidate.role === ROLES.NUTRITIONIST &&
        candidate.email === normalizeEmail(email) &&
        candidate.password === password
    );
    if (!user) throw new Error('Credenziali nutrizionista non valide');

    const tenant = getTenant(state, user.tenantId);
    if (!tenant) throw new Error('Tenant non trovato');

    if (tenant.accountStatus === ACCOUNT_STATUS.PENDING_APPROVAL) {
      throw new Error('Il tuo account è in attesa di approvazione da parte dell\'amministratore.');
    }
    if (tenant.accountStatus === ACCOUNT_STATUS.REJECTED) {
      throw new Error('La tua richiesta di iscrizione è stata rifiutata.');
    }

    const subscription = getSubscriptionByTenant(state, user.tenantId);
    const accountStatus = deriveAccountStatus(tenant, subscription);

    return { role: ROLES.NUTRITIONIST, userId: user.id, tenantId: user.tenantId, accountStatus };
  },
};

/* ── Public Signup API ─────────────────────────────────────── */
export const signupApi = {
  registerNutritionist: ({ email, password, firstName, lastName }) => {
    // Validations
    if (!email || !password || !firstName || !lastName) {
      throw new Error('Email, password, nome e cognome sono obbligatori.');
    }
    if (password.length < 6) {
      throw new Error('La password deve essere di almeno 6 caratteri.');
    }
    let state = getState();
    state = checkSignupRateLimit(state);
    const norm = normalizeEmail(email);
    if (state.users.some((u) => u.email === norm)) {
      throw new Error('Email già registrata.');
    }
     const displayName = `Dott. ${firstName} ${lastName}`;
     const slugBase = slugify(`${firstName} ${lastName}`);
     const slug = makeUniqueSlug(state, slugBase);
     const tenantId = uid('tenant');
     const userId = uid('user');
     // Fix: definizione slugAliases
     const slugAliases = {};
    // Account subito attivo in trial
    const now = new Date();
    const startAt = now.toISOString();
    const endAt = addDays(now, 2).toISOString();
    const tenant = {
      id: tenantId,
      slug,
         slugAliases,
      displayName,
      logoUrl: '/logo.png',
      logoFilename: 'logo.png',
      isBlocked: false,
      accountStatus: ACCOUNT_STATUS.TRIAL_ACTIVE,
      createdAt: nowIso(),
      billing: null,
    };
    const user = {
      id: userId,
      role: ROLES.NUTRITIONIST,
      tenantId,
      email: norm,
      password,
      name: displayName,
    };
    const subscription = {
      id: uid('sub'),
      tenantId,
      plan: 'trial_2',
      status: 'active',
      startAt,
      endAt,
      createdAt: nowIso(),
    };
    state = appendAudit(state, 'signup', norm, { tenantId, displayName });
    commit({
      ...state,
      users: [...state.users, user],
      tenants: [...state.tenants, tenant],
      subscriptions: [...(state.subscriptions || []), subscription],
      notifications: [
        {
          id: uid('notif'),
          tenantId,
          title: 'Benvenuto! Registrazione completata',
          body: 'Hai 2 giorni di prova gratuita. Alla scadenza sarà necessario sottoscrivere un abbonamento per continuare.',
          read: false,
          createdAt: nowIso(),
          metaKey: `signup-${tenantId}`,
        },
        ...state.notifications,
      ],
    });
    return { ok: true, message: 'Benvenuto! Hai 2 giorni di prova gratuita. Alla scadenza sarà necessario sottoscrivere un abbonamento per continuare.' };
  },
};


export const masterApi = {
  getDashboard: (session) => {
    assertRole(session, [ROLES.MASTER]);
    const state = getState();
    const nutritionists = state.users
      .filter((user) => user.role === ROLES.NUTRITIONIST)
      .map((user) => {
        const tenant = getTenant(state, user.tenantId);
        const subscription = getSubscriptionByTenant(state, user.tenantId);
        const accountStatus = deriveAccountStatus(tenant, subscription);
        return { user, tenant, subscription, accountStatus };
      });

    const pendingSignups = nutritionists.filter((n) => n.accountStatus === ACCOUNT_STATUS.PENDING_APPROVAL);
    const pendingRequests = state.subscriptionRequests.filter((request) => request.status === REQUEST_STATUS.PENDING);
    const masterNotifications = state.notifications.filter((n) => n.tenantId === '__master');

    return {
      nutritionists,
      pendingSignups,
      promotions: state.promotions,
      pendingRequests,
      announcements: state.announcements,
      referrals: state.referrals,
      masterNotifications,
      auditLog: state.auditLog ?? [],
    };
  },

  approveSignup: (session, tenantId) => {
    assertRole(session, [ROLES.MASTER]);
    let state = getState();
    const tenant = getTenant(state, tenantId);
    if (!tenant) throw new Error('Tenant non trovato');
    if (tenant.accountStatus !== ACCOUNT_STATUS.PENDING_APPROVAL) {
      throw new Error('Questo account non è in stato "in attesa di approvazione".');
    }

    // Crea subscription trial 2 giorni all'approvazione
    const now = new Date();
    const startAt = now.toISOString();
    const endAt = addDays(now, 2).toISOString();
    const subscription = {
      id: uid('sub'),
      tenantId,
      plan: 'trial_2',
      status: 'active',
      startAt,
      endAt,
      renewalUrl: '',
      updatedAt: nowIso(),
    };
    state = {
      ...state,
      tenants: state.tenants.map((t) =>
        t.id === tenantId ? { ...t, accountStatus: ACCOUNT_STATUS.ACTIVE } : t
      ),
      subscriptions: [...state.subscriptions, subscription],
      notifications: [
        {
          id: uid('notif'),
          tenantId,
          title: 'Iscrizione approvata',
          body: 'Il tuo account è stato approvato. Hai 2 giorni di prova gratuita.',
          read: false,
          createdAt: nowIso(),
          metaKey: `approve-${tenantId}`,
        },
        ...state.notifications,
      ],
    };

    const user = state.users.find((u) => u.tenantId === tenantId);
    state = appendAudit(state, AUDIT_EVENT.APPROVE, session.userId, { tenantId, email: user?.email });

    state = sendEmail({
      state,
      to: user?.email ?? tenantId,
      subject: 'Iscrizione approvata — NutriScale Pro',
      body: 'Il tuo account è stato approvato. Potrai accedere alla dashboard non appena verrà attivato un abbonamento.',
    });

    commit(state);
    return { ok: true };
  },

  rejectSignup: (session, tenantId, reason = '') => {
    assertRole(session, [ROLES.MASTER]);
    let state = getState();
    const tenant = getTenant(state, tenantId);
    if (!tenant) throw new Error('Tenant non trovato');
    if (tenant.accountStatus !== ACCOUNT_STATUS.PENDING_APPROVAL) {
      throw new Error('Questo account non è in stato "in attesa di approvazione".');
    }

    state = {
      ...state,
      tenants: state.tenants.map((t) =>
        t.id === tenantId ? { ...t, accountStatus: ACCOUNT_STATUS.REJECTED, rejectionReason: reason } : t
      ),
      notifications: [
        {
          id: uid('notif'),
          tenantId,
          title: 'Iscrizione rifiutata',
          body: reason ? `La tua richiesta è stata rifiutata: ${reason}` : 'La tua richiesta di iscrizione è stata rifiutata.',
          read: false,
          createdAt: nowIso(),
          metaKey: `reject-${tenantId}`,
        },
        ...state.notifications,
      ],
    };

    const user = state.users.find((u) => u.tenantId === tenantId);
    state = appendAudit(state, AUDIT_EVENT.REJECT, session.userId, { tenantId, email: user?.email, reason });
    commit(state);
    return { ok: true };
  },

  activateSubscription: (session, tenantId, plan) => {
    assertRole(session, [ROLES.MASTER]);
    let state = getState();
    const tenant = getTenant(state, tenantId);
    if (!tenant) throw new Error('Tenant non trovato');

    const allowedStatuses = [
      ACCOUNT_STATUS.APPROVED_NO_SUBSCRIPTION,
      ACCOUNT_STATUS.ACTIVE,
      ACCOUNT_STATUS.EXPIRED,
      ACCOUNT_STATUS.SUSPENDED,
    ];
    if (!allowedStatuses.includes(tenant.accountStatus)) {
      throw new Error('L\'account non è in uno stato che consente l\'attivazione.');
    }

    const { startAt, endAt } = computeSubscriptionDates(plan, new Date());
    const existing = getSubscriptionByTenant(state, tenantId);
    const auditEvent = plan === PLAN.TRIAL_14 ? AUDIT_EVENT.ACTIVATE_TRIAL : AUDIT_EVENT.ACTIVATE_PAID;

    if (existing) {
      state = {
        ...state,
        subscriptions: state.subscriptions.map((s) =>
          s.tenantId === tenantId
            ? { ...s, plan, startAt, endAt, status: 'active', updatedAt: nowIso() }
            : s
        ),
      };
    } else {
      state = {
        ...state,
        subscriptions: [
          ...state.subscriptions,
          { id: uid('sub'), tenantId, plan, status: 'active', startAt, endAt, renewalUrl: '', updatedAt: nowIso() },
        ],
      };
    }

    state = {
      ...state,
      tenants: state.tenants.map((t) =>
        t.id === tenantId ? { ...t, accountStatus: ACCOUNT_STATUS.ACTIVE, isBlocked: false } : t
      ),
      notifications: [
        {
          id: uid('notif'),
          tenantId,
          title: 'Abbonamento attivato',
          body: `Il tuo piano ${PLAN_LABELS[plan]} è stato attivato. Il link pazienti è ora funzionante.`,
          read: false,
          createdAt: nowIso(),
          metaKey: `activate-${tenantId}-${Date.now()}`,
        },
        ...state.notifications,
      ],
    };

    state = appendAudit(state, auditEvent, session.userId, { tenantId, plan });
    commit(state);
    return { ok: true };
  },

  createNutritionist: (session, input) => {
    assertRole(session, [ROLES.MASTER]);
    let state = getState();
    assertDoctorDisplayName(input.displayName);

    const slugBase = slugify(input.displayName.replace('Dott.', '').trim());
    const slug = makeUniqueSlug(state, slugBase);

    const tenantId = uid('tenant');
    const userId = uid('user');

    const tenant = {
      id: tenantId,
      slug,
      displayName: input.displayName,
      logoUrl: '/logo.png',
      logoFilename: 'logo.png',
      isBlocked: false,
      accountStatus: ACCOUNT_STATUS.ACTIVE,
      createdAt: nowIso(),
    };

    const user = {
      id: userId,
      role: ROLES.NUTRITIONIST,
      tenantId,
      email: normalizeEmail(input.email),
      password: input.password,
      name: input.displayName,
    };

    const { startAt, endAt } = computeSubscriptionDates(input.plan ?? PLAN.TRIAL_14, new Date());
    const subscription = {
      id: uid('sub'),
      tenantId,
      plan: input.plan ?? PLAN.TRIAL_14,
      status: 'pending',
      startAt,
      endAt,
      renewalUrl: input.renewalUrl ?? '',
      updatedAt: new Date().toISOString(),
    };

    commit({
      ...state,
      users: [...state.users, user],
      tenants: [...state.tenants, tenant],
      subscriptions: [...state.subscriptions, subscription],
    });

    return { user, tenant, subscription };
  },

  updateNutritionist: (session, tenantId, patch) => {
    assertRole(session, [ROLES.MASTER]);
    const state = getState();

    const tenants = state.tenants.map((tenant) => {
      if (tenant.id !== tenantId) return tenant;
      if (patch.displayName) assertDoctorDisplayName(patch.displayName);
      return {
        ...tenant,
        displayName: patch.displayName ?? tenant.displayName,
        isBlocked: typeof patch.isBlocked === 'boolean' ? patch.isBlocked : tenant.isBlocked,
      };
    });

    commit({ ...state, tenants });
    return { ok: true };
  },

  deleteNutritionist: (session, tenantId) => {
    assertRole(session, [ROLES.MASTER]);
    let state = getState();
    const user = state.users.find((u) => u.tenantId === tenantId);
    state = appendAudit(state, AUDIT_EVENT.DELETE, session.userId, { tenantId, email: user?.email });

    commit({
      ...state,
      tenants: state.tenants.filter((tenant) => tenant.id !== tenantId),
      users: state.users.filter((u) => u.tenantId !== tenantId),
      subscriptions: state.subscriptions.filter((sub) => sub.tenantId !== tenantId),
      referrals: state.referrals.filter((referral) => referral.tenantId !== tenantId),
      notifications: state.notifications.filter((notification) => notification.tenantId !== tenantId),
      subscriptionRequests: state.subscriptionRequests.filter((request) => request.tenantId !== tenantId),
    });

    return { ok: true };
  },

  setSubscription: (session, tenantId, { plan, manualEndAt, renewalUrl, activate = true }) => {
    assertRole(session, [ROLES.MASTER]);
    const state = getState();

    const subscriptions = state.subscriptions.map((subscription) => {
      if (subscription.tenantId !== tenantId) return subscription;

      if (manualEndAt) {
        return {
          ...subscription,
          endAt: new Date(manualEndAt).toISOString(),
          renewalUrl: renewalUrl ?? subscription.renewalUrl,
          status: activate ? 'active' : subscription.status,
          updatedAt: new Date().toISOString(),
        };
      }

      const dates = computeSubscriptionDates(plan, new Date());
      return {
        ...subscription,
        plan,
        startAt: dates.startAt,
        endAt: dates.endAt,
        renewalUrl: renewalUrl ?? subscription.renewalUrl,
        status: activate ? 'active' : subscription.status,
        updatedAt: new Date().toISOString(),
      };
    });

    commit({ ...state, subscriptions });
    return { ok: true };
  },

  blockTenant: (session, tenantId, blocked) => {
    assertRole(session, [ROLES.MASTER]);
    let state = getState();
    state = {
      ...state,
      tenants: state.tenants.map((tenant) =>
        tenant.id === tenantId
          ? {
              ...tenant,
              isBlocked: blocked,
              accountStatus: blocked ? ACCOUNT_STATUS.SUSPENDED : ACCOUNT_STATUS.ACTIVE,
            }
          : tenant
      ),
    };
    state = appendAudit(state, blocked ? AUDIT_EVENT.SUSPEND : AUDIT_EVENT.UNSUSPEND, session.userId, { tenantId });
    commit(state);
    return { ok: true };
  },

  setPromotion: (session, type, patch) => {
    assertRole(session, [ROLES.MASTER]);
    const state = getState();
    const promotions = state.promotions.map((promotion) => {
      if (promotion.type !== type) return promotion;
      return { ...promotion, ...patch };
    });
    commit({ ...state, promotions });
    return { ok: true };
  },

  createAnnouncement: (session, input) => {
    assertRole(session, [ROLES.MASTER]);
    const state = getState();
    const announcement = {
      id: uid('msg'),
      title: input.title,
      body: input.body,
      active: true,
      createdAt: new Date().toISOString(),
    };

    commit({ ...state, announcements: [announcement, ...state.announcements] });
    return announcement;
  },

  decideSubscriptionRequest: (session, requestId, decision, reason = '') => {
    assertRole(session, [ROLES.MASTER]);
    let state = getState();
    const request = state.subscriptionRequests.find((item) => item.id === requestId);
    if (!request) throw new Error('Richiesta non trovata');
    if (request.status !== REQUEST_STATUS.PENDING) throw new Error('Richiesta già gestita');

    const requests = state.subscriptionRequests.map((item) =>
      item.id === requestId
        ? {
            ...item,
            status: decision,
            rejectionReason: decision === REQUEST_STATUS.REJECTED ? reason : '',
            updatedAt: new Date().toISOString(),
          }
        : item
    );

    state = { ...state, subscriptionRequests: requests };

    if (decision === REQUEST_STATUS.APPROVED) {
      const dates = computeSubscriptionDates(request.plan, new Date());
      state = {
        ...state,
        subscriptions: state.subscriptions.map((sub) =>
          sub.tenantId === request.tenantId
            ? {
                ...sub,
                plan: request.plan,
                startAt: dates.startAt,
                endAt: dates.endAt,
                status: 'active',
                updatedAt: new Date().toISOString(),
              }
            : sub
        ),
        tenants: state.tenants.map((tenant) =>
          tenant.id === request.tenantId ? { ...tenant, isBlocked: false } : tenant
        ),
      };
    }

    const notification = {
      id: uid('notif'),
      tenantId: request.tenantId,
      title:
        decision === REQUEST_STATUS.APPROVED
          ? 'Richiesta abbonamento approvata'
          : 'Richiesta abbonamento rifiutata',
      body:
        decision === REQUEST_STATUS.APPROVED
          ? 'Il tuo piano è stato attivato.'
          : `La richiesta è stata rifiutata${reason ? `: ${reason}` : '.'}`,
      read: false,
      createdAt: new Date().toISOString(),
      metaKey: `${requestId}-${decision}`,
    };

    commit({ ...state, notifications: [notification, ...state.notifications] });
    return { ok: true };
  },

  markReferralPurchased: (session, referralId) => {
    assertRole(session, [ROLES.MASTER]);
    let state = getState();
    const referral = state.referrals.find((item) => item.id === referralId);
    if (!referral) throw new Error('Referral non trovato');
    if (referral.status === REFERRAL_STATUS.PURCHASED) return { ok: true };

    state = {
      ...state,
      referrals: state.referrals.map((item) =>
        item.id === referralId
          ? { ...item, status: REFERRAL_STATUS.PURCHASED, convertedAt: new Date().toISOString() }
          : item
      ),
      subscriptions: state.subscriptions.map((sub) =>
        sub.tenantId === referral.tenantId ? extendSubscriptionByMonths(sub, 1, new Date()) : sub
      ),
      notifications: [
        {
          id: uid('notif'),
          tenantId: referral.tenantId,
          title: 'Referral convertito',
          body: 'Hai ottenuto +1 mese di estensione abbonamento.',
          read: false,
          createdAt: new Date().toISOString(),
          metaKey: `referral-bonus-${referral.id}`,
        },
        ...state.notifications,
      ],
    };

    commit(state);
    return { ok: true };
  },
};

export const nutritionistApi = {
  getDashboard: (session) => {
    assertRole(session, [ROLES.NUTRITIONIST]);
    const state = getState();
    const tenant = getTenant(state, session.tenantId);
    const subscription = getSubscriptionByTenant(state, session.tenantId);
    const accountStatus = deriveAccountStatus(tenant, subscription);
    const requests = state.subscriptionRequests.filter((item) => item.tenantId === session.tenantId);
    const announcements = state.announcements.filter((item) => item.active);
    const referrals = state.referrals.filter((item) => item.tenantId === session.tenantId);
    const notifications = state.notifications.filter((item) => item.tenantId === session.tenantId);

    const slotsPromo = getPromotion(state, PROMOTION_TYPE.LIMITED_SLOTS_DISCOUNT);
    const freeMonthPromo = getPromotion(state, PROMOTION_TYPE.FREE_MONTH_REFERRAL);

    return {
      tenant,
      subscription,
      accountStatus,
      requests,
      announcements,
      referrals,
      notifications,
      promotions: { slotsPromo, freeMonthPromo },
      publicUrl: `${window.location.origin}/n/${tenant.slug}`,
      currentPrices: {
        month1: resolvePlanPrice(state, PLAN.MONTH_1),
        month12: resolvePlanPrice(state, PLAN.MONTH_12),
      },
    };
  },

  updateBranding: (session, { displayName, logo }) => {
    assertRole(session, [ROLES.NUTRITIONIST]);
    let state = getState();
    const tenant = getTenant(state, session.tenantId);
    if (!tenant) throw new Error('Tenant non trovato');

    if (displayName) {
      assertDoctorDisplayName(displayName);
    }

    let nextLogoUrl = tenant.logoUrl;
    let nextLogoFilename = tenant.logoFilename;

    if (logo) {
      if (!LOGO_ALLOWED_TYPES.includes(logo.type)) {
        throw new Error('Formato logo non consentito (usa PNG/JPEG/WEBP).');
      }
      if (logo.size > LOGO_MAX_SIZE_BYTES) {
        throw new Error('Logo troppo grande. Limite 1MB.');
      }
      nextLogoUrl = logo.dataUrl;
      nextLogoFilename = sanitizeFilename(logo.filename ?? 'logo');
    }

    state = {
      ...state,
      tenants: state.tenants.map((item) =>
        item.id === session.tenantId
          ? {
              ...item,
              displayName: displayName ?? item.displayName,
              logoUrl: nextLogoUrl,
              logoFilename: nextLogoFilename,
            }
          : item
      ),
      users: state.users.map((user) =>
        user.tenantId === session.tenantId ? { ...user, name: displayName ?? user.name } : user
      ),
    };

    commit(state);
    return { ok: true };
  },

  addReferral: (session, input) => {
    assertRole(session, [ROLES.NUTRITIONIST]);
    const state = getState();
    const referral = {
      id: uid('ref'),
      tenantId: session.tenantId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: normalizeEmail(input.email),
      status: REFERRAL_STATUS.INVITED,
      createdAt: new Date().toISOString(),
    };

    commit({ ...state, referrals: [referral, ...state.referrals] });
    return referral;
  },

  submitSubscriptionRequest: (session, payload) => {
    assertRole(session, [ROLES.NUTRITIONIST]);
    const state = getState();

    for (const field of BILLING_REQUIRED_FIELDS) {
      if (!payload.billing?.[field]) {
        throw new Error(`Campo obbligatorio mancante: ${field}`);
      }
    }

    const request = {
      id: uid('req'),
      tenantId: session.tenantId,
      plan: payload.plan,
      status: REQUEST_STATUS.PENDING,
      billing: payload.billing,
      paymentLink: payload.paymentLink ?? '',
      notes: payload.notes ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    commit({ ...state, subscriptionRequests: [request, ...state.subscriptionRequests] });
    return request;
  },

  markNotificationRead: (session, notificationId) => {
    assertRole(session, [ROLES.NUTRITIONIST]);
    const state = getState();
    const notifications = state.notifications.map((item) =>
      item.id === notificationId && canAccessTenant(session, item.tenantId)
        ? { ...item, read: true }
        : item
    );
    commit({ ...state, notifications });
    return { ok: true };
  },
};

export const publicApi = {
  getTenantPage: (slug) => {
    let state = getState();
    state = checkPublicRateLimit(state, slug);
    commit(state);
    const tenant = state.tenants.find((item) => item.slug === slug);
    if (!tenant) {
      throw new Error('Nutrizionista non trovato');
    }
    // Solo TRIAL_ACTIVE e ACTIVE_PAID hanno pagina pubblica attiva
    const subscription = getSubscriptionByTenant(state, tenant.id);
    const accountStatus = deriveAccountStatus(tenant, subscription);
    const active = accountStatus === ACCOUNT_STATUS.TRIAL_ACTIVE || accountStatus === ACCOUNT_STATUS.ACTIVE_PAID || accountStatus === ACCOUNT_STATUS.ACTIVE;
    if (!active) {
      throw new Error('Nutrizionista non trovato');
    }
    return {
      tenant: { displayName: tenant.displayName, slug: tenant.slug, logoUrl: tenant.logoUrl },
      isAccessActive: active,
      foodDatabase: state.foodDatabase,
      renewalUrl: subscription?.renewalUrl ?? '',
      blockReason: '',
    };
  },
};

export const internalApi = {
  resetAllData: () => {
    localStorage.removeItem('nutriscale_saas_v1');
    loadState();
  },

  listPlans: () => [
    { id: PLAN.TRIAL_14, label: PLAN_LABELS[PLAN.TRIAL_14] },
    { id: PLAN.MONTH_1, label: PLAN_LABELS[PLAN.MONTH_1] },
    { id: PLAN.MONTH_12, label: PLAN_LABELS[PLAN.MONTH_12] },
  ],
};
