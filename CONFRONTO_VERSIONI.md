# Confronto versioni — NutriScale.Pro (Corrente) vs NutriScalePro-main (Backup)

> Report generato tramite analisi file-per-file di entrambi i progetti.

---

## Indice

1. [Panoramica architetturale](#1-panoramica-architetturale)
2. [File identici (nessuna differenza)](#2-file-identici-nessuna-differenza)
3. [File modificati — differenze dettagliate](#3-file-modificati--differenze-dettagliate)
4. [File presenti SOLO nella versione corrente](#4-file-presenti-solo-nella-versione-corrente)
5. [Conclusione — Cosa si perderebbe tornando al backup](#5-conclusione--cosa-si-perderebbe-tornando-al-backup)

---

## 1. Panoramica architetturale

| Aspetto | Backup (NutriScalePro-main) | Corrente (NutriScale.Pro) |
|---|---|---|
| **Persistenza dati** | Solo `localStorage` | `localStorage` + Firebase (Auth, Firestore, Realtime DB, Storage) con routing automatico |
| **Tailwind CSS** | CDN via `<script>` in `index.html` | Build nativa Tailwind v4 via `@tailwindcss/vite` |
| **Autenticazione** | Simula login in-memory (localStorage) | Firebase Auth + fallback localStorage, con routing trasparente |
| **Sistema Beta** | Assente | Completo: `BetaBadge`, `BetaBanner`, `BetaOverlay` con sezioni bloccabili |
| **Accesso pazienti** | Pagina pubblica diretta per slug | Pagina pubblica con codice accesso opzionale e messaggio di benvenuto |
| **Link pagamento** | `renewalUrl` per singola subscription | Sistema `globalPaymentLinks` gestito centralmente dal MASTER |
| **Feedback** | Assente | Sistema feedback nutrizionista → MASTER con oggetto/corpo |
| **Migrazione dati** | N/A | Pannello `MigrationPanel` + logica `migrateToFirebase` |
| **File totali src/** | 23 file | 33 file (+10 nuovi) |

---

## 2. File identici (nessuna differenza)

I seguenti file sono **byte-per-byte identici** tra le due versioni:

### Core (`src/core/`)
| File | Esportazioni principali |
|---|---|
| `constants.js` | `ROLES`, `ACCOUNT_STATUS`, `PLAN`, `PLAN_LABELS`, `PROMOTION_TYPE`, `REQUEST_STATUS`, `PRICES` |
| `rbac.js` | `assertRole`, `canAccessTenant` |
| `scheduler.js` | `runSchedulers`, `ensureNotification` |
| `storage.js` | `loadState`, `saveState` (localStorage) |
| `subscriptionRequest.js` | `requestSubscription` |
| `subscriptions.js` | `computeSubscriptionDates`, `isSubscriptionActive`, `getExpiryNoticeDays`, `extendSubscriptionByMonths` |
| `utils.js` | `uid`, `nowIso`, `addDays`, `addMonths`, `daysUntil`, `formatDate`, `sanitizeFilename`, `slugify`, `isValidDoctorDisplayName`, `assertDoctorDisplayName`, `normalizeEmail` |
| `emailGateway.js` | `sendEmail` |

### UI (`src/ui/`)
| File | Esportazioni principali |
|---|---|
| `Drawer.jsx` | `Drawer` (componente con animazione slide) |
| `Dropdown.jsx` | `Select` (dropdown custom) |
| `index.js` | Barrel re-export di tutti i componenti UI |
| `Modal.jsx` | `Modal` (dialog con overlay e animazione) |
| `Toast.jsx` | `Toast` (notifica temporanea) |
| `Tooltip.jsx` | `Tooltip` (tooltip posizionale) |
| `useMotion.js` | `useMotion` (hook riduzione animazioni) |

### Altro
| File | Note |
|---|---|
| `src/main.jsx` | Entry point React — identico |

---

## 3. File modificati — differenze dettagliate

### 3.1 `src/core/foodDatabase.js`

**Dimensione**: Backup ~120 righe → Corrente ~600+ righe

| Aspetto | Backup | Corrente |
|---|---|---|
| **Alimenti** | ~12 elementi base (pollo, pasta, riso, broccoli, ecc.) | **~150+ alimenti** organizzati in 13 categorie (Cereali e Pasta, Carne Bianca, Carne Rossa, Pesce, Frutti di Mare, Legumi, Verdure, Tuberi, Uova, Proteine Vegetali, Frutta) |
| **Metodi di cottura** | Pochi metodi per alimento | Multipli metodi per alimento con fattori dettagliati e `tips` |
| **Export aggiuntivo** | Solo `convertWeight` | + `formatMethod` (formatta nome metodo in italiano leggibile) |

**Impatto**: Questa è la più grande espansione di *contenuto* del progetto. Tornare al backup significherebbe perdere il 90%+ del database alimentare.

---

### 3.2 `src/core/migrations.js`

**Differenze nella funzione `seedState()`:**

| Campo | Backup | Corrente |
|---|---|---|
| `tenant.feedbacks` | Assente | `[]` (array vuoto iniziale) |
| `tenant.globalPaymentLinks` | Assente | `[]` |
| `tenant.patientAccessCode` | Assente | `''` |
| `tenant.patientWelcomeMessage` | Assente | `'Inserisci il codice fornito dal tuo nutrizionista per accedere al convertitore.'` |
| Testo announcements | `"NutriScale SaaS"` | `"NutriScale Pro"` |

**Differenze nella funzione `migrateState()`:**

La versione corrente aggiunge le seguenti migrazioni di backfill:
- Backfill `patientAccessCode` e `patientWelcomeMessage` su tutti i tenant
- Migrazione titolo announcements `"NutriScale SaaS"` → `"NutriScale Pro"`
- Recovery `feedbacks` (inizializzazione array se mancante)
- Recovery `globalPaymentLinks` (inizializzazione array se mancante)

---

### 3.3 `src/core/api.js` (file più critico)

**Dimensione**: Backup 865 righe → Corrente 1013 righe (+148 righe)

#### Import aggiuntivi (solo corrente)
```js
import { BETA_MODE } from './betaConfig.js';
import { syncTenantPublic } from './publicStore.js';
```

#### Funzioni/helper privati aggiunti (solo corrente)
| Funzione | Scopo |
|---|---|
| `getUserByTenant(state, tenantId)` | Trova l'utente proprietario di un tenant |
| `normalizeGlobalPaymentLinks(links)` | Sanitizza e valida array di link pagamento |
| `_syncTenant(state, tenantId)` | Sincronizza dati pubblici del tenant su Firebase RTDB |

#### Differenze per modulo API

**`signupApi.registerNutritionist`**
| Aspetto | Backup | Corrente |
|---|---|---|
| Subscription includes | `renewalUrl` (dall'input) | Nessun `renewalUrl` |
| Tenant includes | Standard | + `patientAccessCode: ''`, `patientWelcomeMessage: '...'` |
| Messaggio benvenuto | `"Benvenuto su NutriScale SaaS!"` | `"Benvenuto su NutriScale Pro!"` |
| Return value | Solo `{ ok, message, publicUrl }` | + `email`, `password` nel return |

**`masterApi`**
| Funzione | Backup | Corrente |
|---|---|---|
| `getDashboard` | Senza feedbacks | + `feedbacks` aggregati con `nutritionistName`/`nutritionistEmail` risolti |
| `setGlobalPaymentLinks` | **Assente** | Presente — salva link pagamento globali e sincronizza con RTDB |
| `createNutritionist` | Include `renewalUrl` nella subscription | Senza `renewalUrl` |
| `activateSubscription` | Senza sync | + `_syncTenant()` dopo modifica |

**`nutritionistApi`**
| Funzione | Backup | Corrente |
|---|---|---|
| `getDashboard` return | Senza `globalPaymentLinks` | + `globalPaymentLinks` dallo stato globale |
| `updatePatientAccessSettings` | **Assente** | Presente — salva codice accesso e messaggio benvenuto + sync RTDB |
| `submitFeedback` | **Assente** | Presente — invia feedback con subject/body + notifica al MASTER |
| `updateBranding` | Senza sync | + `_syncTenant()` dopo aggiornamento |
| `submitSubscriptionRequest` | Include `paymentLink` dall'input | Senza `paymentLink` |

**`publicApi`**
| Aspetto | Backup | Corrente |
|---|---|---|
| `getTenantPage` return | Base (tenant, convertWeight) | + `globalPaymentLinks`, `requiresPatientCode`, `patientWelcomeMessage` |
| `verifyPatientAccessCode` | **Assente** | Presente — verifica codice accesso paziente |
| Visibilità pagina | Solo se subscription attiva | + bypass `BETA_MODE` |

---

### 3.4 `src/App.jsx` (file più grande)

**Dimensione**: Backup 1185 righe → Corrente 1569 righe (+384 righe)

#### Import aggiuntivi (solo corrente)
```js
import { BetaBadge, BetaBanner, BetaOverlay } from './ui/BetaComponents.jsx';
import { BETA_MODE } from './core/betaConfig.js';
```

#### Componente `Card`
| Aspetto | Backup | Corrente |
|---|---|---|
| Prop `subtitle` | Assente | Presente — visualizza sottotitolo sotto il titolo |

#### Componente `PublicConverter`
| Aspetto | Backup | Corrente |
|---|---|---|
| Codice accesso paziente | Assente | Sistema completo con `codeInput`, `accessError`, `isUnlocked` |
| `globalPaymentLinks` | Assente | Visualizzati quando pagina non accessibile |
| `requiresPatientCode` | Assente | Gate di accesso con form codice + `patientWelcomeMessage` |

#### Componente `NutritionistRow`
| Aspetto | Backup | Corrente |
|---|---|---|
| `statusVariantMap` | Senza `PAYMENT_REQUIRED` | + `PAYMENT_REQUIRED: 'warning'` |
| `canActivate` | Senza `PAYMENT_REQUIRED` | + `PAYMENT_REQUIRED` nella lista |

#### Componente `MasterDashboard`
| Aspetto | Backup | Corrente |
|---|---|---|
| Titolo header | `"Dashboard MASTER"` | `"Amministrazione Piattaforma"` |
| `refresh()` | Sincrono | `async` con `Promise.resolve()` |
| `isRefreshing` | Assente | Presente — shimmer bar durante caricamento |
| `paymentLinkDraft` | Assente | Stato per input link pagamento globali |
| Sezione "Link pagamento globali" | Assente | Card completa con CRUD link |
| Sezione "Feedback nutrizionisti" | Assente | Card con elenco feedback ricevuti |
| Padding responsive | Standard | `p-4 md:p-6` |
| `createForm.renewalUrl` | Presente | **Rimosso** |
| Modal login master `maxWidth` | `max-w-xs` | `max-w-sm` |
| Paywall > link rinnovo | `subscription.renewalUrl` | `globalPaymentLinks` (sistema centralizzato) |
| Sezione comunicazioni | In griglia 2-col con Paywall | Separata come Card dedicata |

#### Componente `NutritionistDashboard`
| Aspetto | Backup | Corrente |
|---|---|---|
| Sezione tabs | Assente — vista unica | **Tab `clients` / `dashboard`** con sezioni separate |
| `activeSection` | Assente | Stato per tab attiva (`'clients'` o `'dashboard'`) |
| `clientAccessCode` / `clientWelcomeMessage` | Assenti | Stati per gestione accesso pazienti |
| `feedbackSubject` / `feedbackBody` | Assenti | Stati per invio feedback |
| `isRefreshing` | Assente | Shimmer bar durante aggiornamento |
| `refresh()` | Sincrono | `async` con `Promise.resolve()` |
| `paymentLink` nella subscription request | Presente (campo input) | **Rimosso** (sostituito da globalPaymentLinks) |
| `BetaBanner` | Assente | Visualizzato se `BETA_MODE` attivo |
| `BetaOverlay` | Assente | Wrappa sezioni `subscription`, `subscriptionRequest`, `promotions`, `operativeDashboard` |
| Card "Feedback e suggerimenti" | Assente | Presente con form oggetto/corpo e speciale stile Beta |
| Card "Codice accesso pazienti" | Assente | Presente con input codice, messaggio benvenuto, bottoni salva/disattiva |
| Sezione "Comunicazioni MASTER" | Visibile direttamente | Nella tab `dashboard` dentro `BetaOverlay` |
| Gate feature non-ACTIVE | `APPROVED_NO_SUBSCRIPTION`, `EXPIRED`, `SUSPENDED` | + `PENDING_APPROVAL`, `REJECTED` |
| `needsSubscriptionAction` | Assente | Calcola stati che richiedono azione abbonamento + banner informativo |
| Logo fallback | `<img>` con `/logo.png` | Placeholder dashed box con testo "Il tuo Logo" |

#### Componente `App` (router principale)
| Aspetto | Backup | Corrente |
|---|---|---|
| Modal login admin | Stile compatto `max-w-xs` | Stile esteso con badge "Area Master", `max-w-sm` |
| Layout bottoni login | `flex-1` con bordi arrotondati | `w-1/2` con stile diverso |

---

### 3.5 `index.html`

| Aspetto | Backup | Corrente |
|---|---|---|
| Tailwind CDN | `<script src="https://cdn.tailwindcss.com"></script>` | **Rimosso** (Tailwind via build Vite) |
| Viewport meta | Standard | + `viewport-fit=cover` |

---

### 3.6 `package.json`

**Dipendenze aggiunte nella versione corrente:**

| Pacchetto | Tipo | Versione |
|---|---|---|
| `firebase` | dependency | `^12.10.0` |
| `@tailwindcss/vite` | devDependency | `^4.1.8` |
| `autoprefixer` | devDependency | `^10.4.21` |
| `postcss` | devDependency | `^8.5.4` |
| `tailwindcss` | devDependency | `^4.1.8` |

---

### 3.7 `vite.config.js`

| Aspetto | Backup | Corrente |
|---|---|---|
| Plugin | Solo `react()` | `tailwindcss()` + `react()` |
| Import extra | Nessuno | `import tailwindcss from '@tailwindcss/vite'` |

---

### 3.8 `src/index.css`

| Aspetto | Backup | Corrente |
|---|---|---|
| Import Tailwind | Assente | `@import "tailwindcss"` (build nativa) |
| Overflow fix | Assente | `html, body { overflow-x: hidden; width: 100%; }` |
| Shimmer animation | Assente | Classe `.shimmer-bar` con animazione gradient |

---

### 3.9 `src/ui/NutritionistSignup.jsx`

Differenza minima: una riga di commento diversa. Funzionalmente **identico**.

### 3.10 `src/ui/SubscriptionPaywall.jsx`

Differenza minima: la versione corrente ha un `<div>` wrapper aggiuntivo. Funzionalmente **identico**.

---

## 4. File presenti SOLO nella versione corrente

### 4.1 Core — Layer Firebase

| File | Esportazioni | Scopo |
|---|---|---|
| **`firebase.js`** | `auth`, `db`, `rtdb`, `storage` | Inizializzazione Firebase App (progetto: `nutriscale-pro`, regione: `europe-west1`). Esporta istanze Auth, Firestore, Realtime DB e Storage. |
| **`authApiFirebase.js`** | `authApiFirebase` → `loginMaster`, `loginNutritionist`, `logout`, `getCurrentUser`, `getDebugLogs`, `clearDebugLogs` | Autenticazione via Firebase Auth con `signInWithEmailAndPassword`. Legge documenti utente da Firestore, verifica ruoli, traduce codici errore Firebase in messaggi italiani, logging debug in localStorage. |
| **`signupApiFirebase.js`** | `signupApiFirebase` → `registerNutritionist` | Registrazione nutrizionista su Firebase: crea utente Auth, documenti Firestore (user, tenant, subscription trial 14gg), notifica di benvenuto. Nota: trial è 14 giorni (vs 2 giorni nel localStorage). |
| **`masterApiFirebase.js`** | `masterApiFirebase` → `getDashboard`, `approveSignup`, `rejectSignup`, `activateSubscription`, `blockTenant`, `deleteNutritionist`, `updateNutritionist` | API MASTER basata su Firestore. Include helper `_syncTenantRTDB` per sincronizzazione dati pubblici. |
| **`nutritionistApiFirebase.js`** | `nutritionistApiFirebase` → `getDashboard`, `updateBranding`, `updatePatientAccessSettings`, `addReferral`, `submitSubscriptionRequest`, `submitFeedback`, `markNotificationRead` | API Nutrizionista basata su Firestore. Upload logo via Firebase Storage. Nota: `addReferral` e `submitSubscriptionRequest` appaiono **duplicati** nel file. |
| **`publicStore.js`** | `syncTenantPublic`, `fetchTenantPublic` | Sincronizzazione dati pubblici tenant su Firebase Realtime Database (`/tenants/{slug}`). Permette accesso cross-device alle pagine paziente senza leggere Firestore. |

### 4.2 Core — Routing e Configurazione

| File | Esportazioni | Scopo |
|---|---|---|
| **`apiRouter.js`** (236 righe) | `initializeApiRouter`, `waitForInit`, `enableFirebaseMode`, `isFirebaseMode`, `isMigrationDone`, `authApiRouter`, `signupApiRouter`, `masterApiRouter`, `nutritionistApiRouter` | **Layer di routing API**: commuta trasparentemente tra API localStorage e API Firebase. Login Firebase-first con fallback localStorage per errori di rete (ma NON per errori di autenticazione). Usa `Proxy` per auto-routing di master/nutritionist API. |
| **`betaConfig.js`** | `BETA_MODE` (`true`), `BETA_CONFIG` | Configurazione Beta: titolo, sottotitolo, messaggio, sezioni bloccate (`subscription`, `paymentLinks`, `subscriptionRequest`, `referrals`, `promotions`, `operativeDashboard`), badge, data scadenza, trial 14 giorni. |

### 4.3 Core — Migrazione

| File | Esportazioni | Scopo |
|---|---|---|
| **`migrateToFirebase.js`** | `migrateDataToFirebase`, `checkMigrationStatus` | Script migrazione localStorage → Firestore: crea utenti Firebase Auth, documenti Firestore per tenant/subscription/notifiche, utente MASTER. |

### 4.4 UI — Componenti Beta e Migrazione

| File | Esportazioni | Scopo |
|---|---|---|
| **`BetaComponents.jsx`** | `BetaBadge`, `BetaOverlay`, `BetaBanner` | `BetaBadge`: pill animata "BETA". `BetaOverlay`: sfoca sezioni con icona lucchetto e messaggio (variante speciale per `operativeDashboard`). `BetaBanner`: banner gradient con countdown giorni trial. |
| **`MigrationPanel.jsx`** | `MigrationPanel` | Pannello UI per triggering migrazione localStorage → Firebase. Mostra stati: checking → ready → migrating → done → error. |

### 4.5 File di configurazione e script

| File | Scopo |
|---|---|
| **`auth_users.json`** | Credenziali utenti per setup iniziale Firebase |
| **`database.rules.json`** | Regole sicurezza Firebase Realtime Database |
| **`firestore.rules`** | Regole sicurezza Firestore |
| **`firebase.json`** | Configurazione deployment Firebase |
| **`BETA_MODE.md`** | Documentazione sistema Beta |
| **`TROUBLESHOOTING_LOGIN.md`** | Guida troubleshooting login |
| **`scripts/seed-rtdb.mjs`** | Script per popolare Realtime Database |
| **`scripts/setup-user.mjs`** | Script creazione utenti Firebase |
| **`scripts/fix-all-visuals.mjs`** | Script correzioni visive |
| **`scripts/fix-landing.mjs`** | Script correzioni landing page |
| **`scripts/create-checkpoint.mjs`** | Script per creare checkpoint del progetto |
| **`tests/`** (4 file) | Test suite: `public-access.test.js`, `rbac.test.js`, `signup-account-status.test.js`, `subscriptions.test.js` |

---

## 5. Conclusione — Cosa si perderebbe tornando al backup

### ❌ Funzionalità completamente perse

1. **Intero layer Firebase** — Autenticazione reale (Auth), persistenza cloud (Firestore), sincronizzazione real-time (RTDB), upload file (Storage). L'app tornerebbe a essere solo localStorage = nessun dato condiviso tra dispositivi, nessun login reale.

2. **Sistema di routing API duale** (`apiRouter.js`) — Il meccanismo che permette di passare trasparentemente da localStorage a Firebase (e viceversa come fallback) sarebbe eliminato.

3. **Sistema Beta completo** — `BetaBadge`, `BetaBanner`, `BetaOverlay`, `betaConfig.js`, tutta la logica di sezioni blurrate/bloccate, countdown trial, badge animati.

4. **Database alimentare espanso** — Da ~12 alimenti base a ~150+ alimenti dettagliati in 13 categorie. Questa è la perdita di contenuto più significativa per l'utente finale.

5. **Sistema codice accesso pazienti** — Possibilità per il nutrizionista di proteggere la propria pagina pubblica con un codice + messaggio di benvenuto personalizzato. Include sia l'API (`updatePatientAccessSettings`, `verifyPatientAccessCode`) che l'UI (form nel profilo, gate nel `PublicConverter`).

6. **Sistema feedback nutrizionista → MASTER** — `submitFeedback` (API) + form UI con oggetto/corpo + aggregazione nella dashboard master.

7. **Link pagamento globali** — Sistema centralizzato `globalPaymentLinks` gestito dal MASTER, visibile a tutti i nutrizionisti e nelle pagine pubbliche. Sostituisce il vecchio sistema `renewalUrl` per singola subscription.

8. **Pannello migrazione** (`MigrationPanel.jsx` + `migrateToFirebase.js`) — Strumenti per migrare dati esistenti da localStorage a Firebase.

9. **Sincronizzazione pubblica RTDB** (`publicStore.js`) — Le pagine paziente non sarebbero più accessibili cross-device tramite Firebase.

10. **Test suite** — 4 file di test per accessi pubblici, RBAC, signup e subscription.

### ❌ Miglioramenti tecnici persi

11. **Build Tailwind nativa** — Si tornerebbe al CDN script (peggiore performance, nessun tree-shaking, nessun purge CSS).

12. **Shimmer bar di caricamento** — Animazione CSS `.shimmer-bar` + stato `isRefreshing` nei dashboard.

13. **Dashboard a tab** — Il `NutritionistDashboard` perderebbe la navigazione a tab (clients / dashboard operativa).

14. **Refresh asincrono** — I `refresh()` tornerebbero sincroni (blocco UI durante caricamento).

15. **Gate account espanso** — Si perderebbero i gate per `PENDING_APPROVAL`, `REJECTED`, `PAYMENT_REQUIRED`.

16. **UX migliorata** — Logo placeholder, modal login ridisegnata, padding responsive, titoli aggiornati.

### ✅ Cosa si conserverebbe tornando al backup

- Tutta la logica RBAC, scheduler, storage localStorage, subscription, utils, email
- Tutti i componenti UI base (Drawer, Modal, Toast, Tooltip, Dropdown, useMotion)
- Il flusso di signup base (senza Firebase)
- Il convertitore pubblico (senza codice accesso, con ~12 alimenti)
- Il sistema promozioni/referral
- Il sistema announcement/notifiche
- La struttura multi-tenant con slug

### Valutazione finale

Il backup rappresenta la **versione "proof of concept"** con localStorage, mentre la versione corrente è la **versione "production-ready"** con Firebase, sistema Beta, UX raffinata e contenuto alimentare completo. La differenza non è incrementale: è un **salto architetturale**. Tornare al backup equivarrebbe a perdere circa il 40% del codice sorgente e le fondamenta per il deployment in produzione.
