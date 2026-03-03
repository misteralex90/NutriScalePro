// API per richiesta abbonamento da parte del nutrizionista
import { REQUEST_STATUS } from './constants.js';
import { uid, nowIso } from './utils.js';

// Queste funzioni non sono esportate da api.js, quindi le importiamo direttamente qui
import { runSchedulers } from './scheduler.js';
import { loadState, saveState } from './storage.js';

const getState = () => runSchedulers(loadState());
const commit = (state) => { saveState(state); return state; };

export const requestSubscription = (session, { plan, billing }) => {
  // Validazioni minime
  if (!plan || !billing || !billing.name || !billing.address || !billing.cap || !billing.city || !billing.province || !billing.country || !billing.email) {
    throw new Error('Compila tutti i dati obbligatori.');
  }
  const state = getState();
  const tenantId = session.tenantId;
  // Crea richiesta
  const request = {
    id: uid('subreq'),
    tenantId,
    plan,
    billing,
    status: REQUEST_STATUS.PENDING,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  commit({
    ...state,
    subscriptionRequests: [request, ...(state.subscriptionRequests || [])],
    tenants: state.tenants.map(t => t.id === tenantId ? { ...t, billing } : t),
  });
  return { ok: true };
};
