import { getExpiryNoticeDays, isSubscriptionActive } from './subscriptions.js';
import { uid } from './utils.js';

const ensureNotification = (state, tenantId, key, title, body) => {
  const exists = state.notifications.some((n) => n.metaKey === key && n.tenantId === tenantId);
  if (exists) return state;
  return {
    ...state,
    notifications: [
      ...state.notifications,
      {
        id: uid('notif'),
        tenantId,
        title,
        body,
        read: false,
        createdAt: new Date().toISOString(),
        metaKey: key,
      },
    ],
  };
};

export const runSchedulers = (state, now = new Date()) => {
  let nextState = state;

  for (const sub of state.subscriptions) {
    if (!isSubscriptionActive(sub, now)) continue;

    const day = getExpiryNoticeDays(sub, now);
    if (day === 10 || day === 5) {
      const key = `expiry-warning-${sub.id}-${day}`;
      nextState = ensureNotification(
        nextState,
        sub.tenantId,
        key,
        `Scadenza tra ${day} giorni`,
        `Il tuo abbonamento scade tra ${day} giorni. Vai su Rinnova per evitare blocchi del link pazienti.`
      );
    }
  }

  return nextState;
};
