/**
 * Configurazione modalità BETA
 * 
 * Imposta BETA_MODE = true per attivare la versione Beta per nutrizionisti.
 * In modalità Beta:
 * - Le sezioni relative agli abbonamenti sono offuscate
 * - I dati sensibili sono nascosti
 * - Viene mostrato un badge/banner Beta
 * - La sezione Feedback è evidenziata per raccogliere opinioni
 * 
 * Per tornare alla versione normale, imposta BETA_MODE = false
 */

export const BETA_MODE = true;

export const BETA_CONFIG = {
  // Messaggio principale da mostrare nelle sezioni offuscate
  title: 'Versione Beta',
  subtitle: 'Prova gratuita a tempo limitato',
  message: `Stai utilizzando una versione Beta gratuita di NutriScale Pro. 
Questa è un'anteprima per testare le funzionalità principali e raccogliere il tuo prezioso feedback.

La versione completa con tutte le funzionalità avanzate sarà disponibile a breve!`,
  
  // CTA per invitare al feedback
  feedbackCta: 'Nel frattempo, aiutaci a migliorare condividendo il tuo feedback nella sezione dedicata.',
  
  // Sezioni da offuscare (blur)
  blurredSections: {
    subscription: true,        // Sezione abbonamenti
    paymentLinks: true,        // Link di pagamento
    subscriptionRequest: true, // Richiesta abbonamento
    referrals: true,          // Sistema referral
    promotions: true,         // Promozioni
    operativeDashboard: true, // Intera dashboard operativa
  },
  
  // Badge Beta da mostrare
  badge: {
    show: true,
    text: 'BETA',
    color: 'emerald',
  },
  
  // Data di scadenza della beta (opzionale)
  expiryDate: null, // Esempio: '2026-04-30'
};
