export const STORAGE_KEY = 'nutriscale_saas_v1';
export const SCHEMA_VERSION = 3;

export const ROLES = {
  MASTER: 'MASTER',
  NUTRITIONIST: 'NUTRITIONIST',
};

export const ACCOUNT_STATUS = {
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED_NO_SUBSCRIPTION: 'APPROVED_NO_SUBSCRIPTION',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  SUSPENDED: 'SUSPENDED',
  REJECTED: 'REJECTED',
  TRIAL_ACTIVE: 'TRIAL_ACTIVE',
  ACTIVE_PAID: 'ACTIVE_PAID',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
};

export const ACCOUNT_STATUS_LABELS = {
  [ACCOUNT_STATUS.PENDING_APPROVAL]: 'In attesa approvazione',
  [ACCOUNT_STATUS.APPROVED_NO_SUBSCRIPTION]: 'Approvato — in attesa abbonamento',
  [ACCOUNT_STATUS.ACTIVE]: 'Attivo',
  [ACCOUNT_STATUS.EXPIRED]: 'Scaduto',
  [ACCOUNT_STATUS.SUSPENDED]: 'Sospeso',
  [ACCOUNT_STATUS.REJECTED]: 'Rifiutato',
  [ACCOUNT_STATUS.TRIAL_ACTIVE]: 'Prova gratuita attiva',
  [ACCOUNT_STATUS.ACTIVE_PAID]: 'Abbonamento attivo',
  [ACCOUNT_STATUS.PAYMENT_REQUIRED]: 'Pagamento richiesto',
};

export const AUDIT_EVENT = {
  SIGNUP: 'signup',
  APPROVE: 'approve',
  REJECT: 'reject',
  ACTIVATE_TRIAL: 'activate_trial',
  ACTIVATE_PAID: 'activate_paid',
  SUSPEND: 'suspend',
  UNSUSPEND: 'unsuspend',
  EXPIRE: 'expire',
  DELETE: 'delete',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const REFERRAL_STATUS = {
  INVITED: 'invited',
  PURCHASED: 'purchased',
};

export const PLAN = {
  TRIAL_14: 'trial_14',
  MONTH_1: 'month_1',
  MONTH_12: 'month_12',
};

export const PLAN_LABELS = {
  [PLAN.TRIAL_14]: 'Trial 14 giorni',
  [PLAN.MONTH_1]: '1 mese',
  [PLAN.MONTH_12]: '12 mesi',
};

export const PLAN_PRICES = {
  standard: {
    [PLAN.MONTH_1]: 7,
    [PLAN.MONTH_12]: 49,
  },
  promoSlots: {
    [PLAN.MONTH_1]: 5,
    [PLAN.MONTH_12]: 39,
  },
};

export const PROMOTION_TYPE = {
  LIMITED_SLOTS_DISCOUNT: 'LIMITED_SLOTS_DISCOUNT',
  FREE_MONTH_REFERRAL: 'FREE_MONTH_REFERRAL',
};

export const PUBLIC_RESERVED_SLUGS = ['master', 'nutritionist', 'n', 'api', 'signup'];

export const LOGO_MAX_SIZE_BYTES = 1024 * 1024;
export const LOGO_ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const BILLING_REQUIRED_FIELDS = [
  'firstName',
  'lastName',
  'taxCodeOrVat',
  'address',
  'country',
  'contactEmail',
];
