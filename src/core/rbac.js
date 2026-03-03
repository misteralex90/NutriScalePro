import { ROLES } from './constants.js';

export const assertRole = (session, allowedRoles) => {
  if (!session?.role) {
    throw new Error('Sessione non autenticata');
  }
  if (!allowedRoles.includes(session.role)) {
    throw new Error('Permessi insufficienti');
  }
};

export const canAccessTenant = (session, tenantId) => {
  if (session.role === ROLES.MASTER) return true;
  if (session.role === ROLES.NUTRITIONIST && session.tenantId === tenantId) return true;
  return false;
};
