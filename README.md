# NutriScale Pro SaaS (Multi-tenant)

Webapp React/Vite convertita in MVP SaaS multi-tenant per nutrizionisti.

## 1) Analisi repo attuale (prima della modifica)

- **Stack**: React 18 + Vite 5, JavaScript, `lucide-react`.
- **Router**: assente (single page locale).
- **Backend/DB**: assente (solo frontend + localStorage).
- **Auth**: login locale con codice in frontend.
- **Storage**: logo e dati in localStorage.
- **Punti da modificare**:
  - introdurre modello multi-tenant con `tenantId` su risorse;
  - creare ruolo `MASTER` separato da `NUTRIZIONISTA`;
  - introdurre pagina pubblica per slug (`/n/:slug` o `/:slug`);
  - workflow richieste abbonamento/fatturazione;
  - promo/referral;
  - scheduler notifiche scadenza (10/5 giorni).

## 2) Architettura implementata

### Data layer (simulazione DB + migrazione)

- Stato persistito in `localStorage` con schema versionato (`nutriscale_saas_v1`).
- Migrazione/seed iniziale in `src/core/migrations.js`.
- Entità implementate:
  - `users` (MASTER, NUTRITIONIST)
  - `tenants` (slug univoco, branding)
  - `subscriptions` (piano, start/end, stato)
  - `promotions` (slot discount + free month referral)
  - `referrals` (`invited -> purchased`)
  - `announcements`
  - `subscriptionRequests` (pending/approved/rejected)
  - `notifications` (in-app)

### API layer + RBAC

- API applicative in `src/core/api.js`:
  - `authApi` (login master/nutrizionista)
  - `masterApi` (CRUD nutrizionisti, promo, richieste, blocco/sblocco, referral converted)
  - `nutritionistApi` (dashboard tenant, branding, referral, richiesta abbonamento)
  - `publicApi` (risoluzione tenant via slug + rate limit minimo)
- Permessi in `src/core/rbac.js`.
- Validazione nome visualizzato lato client+server-like: formato obbligatorio `Dott. Nome Cognome`.

### Scheduler notifiche

- `src/core/scheduler.js` genera notifiche in-app su scadenza a 10 e 5 giorni.
- Esecuzione su caricamento stato e refresh dashboard.
- Predisposto `src/core/emailGateway.js` come interfaccia email (outbox locale), senza provider esterno.

### UI/UX

- `src/App.jsx` ora include:
  - landing con accesso ruoli,
  - login MASTER,
  - login NUTRIZIONISTA,
  - dashboard MASTER,
  - dashboard NUTRIZIONISTA,
  - pagina pubblica pazienti per slug.
- Grafica minimal/professionale e CTA rinnovo dove previsto.
- Paziente senza login: accesso diretto dal link pubblico.

## 3) Rotte disponibili

- `/` landing
- `/master/login`
- `/master/dashboard`
- `/nutritionist/login`
- `/nutritionist/dashboard`
- `/request-subscription` (alias dashboard nutrizionista)
- `/n/:slug` oppure `/:slug` (pubblico pazienti)

## 4) Piano abbonamenti e prezzi

- Trial 14 giorni
- 1 mese (7€ standard)
- 12 mesi (49€ standard)
- Promo slot limitati (attivabili da MASTER):
  - 1 mese 5€
  - 12 mesi 39€
- Promo referral: `+1 mese` per referral convertito (`invited -> purchased`).

## 5) Test

- Unit test:
  - permessi RBAC
  - calcolo scadenze
- Integration-like test:
  - accesso pubblico attivo vs scaduto (logica dominio)

Cartella: `tests/`.

## 6) Run / Migrate

```bash
npm install
npm run dev
```

Per forzare reset + reseed locale (migrazione seed):

1. apri DevTools
2. cancella `localStorage` key `nutriscale_saas_v1`
3. ricarica app

## 7) Config / ENV (predisposizione)

Attualmente MVP frontend-only, quindi senza `.env` obbligatori.

Per passare a produzione backend reale:

- `EMAIL_PROVIDER_API_KEY` (invio email)
- `STORAGE_BUCKET` / `SIGNED_URL_SECRET` (upload logo esterno)
- `CRON_SECRET` (job schedulati server)
- `DATABASE_URL` (persistenza reale)
- `RATE_LIMIT_REDIS_URL` (rate limiting distribuito)

## 8) Credenziali demo seed

- MASTER: `master@nutriscale.app` / `Master123!`
- NUTRIZIONISTA: `demo@nutriscale.app` / `Demo123!`

## 9) Deploy automatico con GitHub + Firebase

È presente workflow in `.github/workflows/firebase-hosting-deploy.yml`:

- trigger su push in `main`
- build app (`npm ci` + `npm run build`)
- deploy live su Firebase Hosting progetto `nutriscale-pro`

### Setup richiesto su GitHub (una sola volta)

1. pubblicare questa repo su GitHub
2. in **GitHub → Settings → Secrets and variables → Actions**, creare il secret:
  - `FIREBASE_SERVICE_ACCOUNT_NUTRISCALE_PRO`
3. valore del secret: JSON della service account key del progetto Firebase `nutriscale-pro`
  - Firebase Console → Project Settings → Service accounts → Generate new private key

### Ripristino (rollback)

- **Hosting live**: in Firebase Console → Hosting → Release history, puoi tornare a una release precedente (rollback rapido del sito).
- **Codice sorgente**: con GitHub puoi tornare a commit/tag precedenti e ridistribuire automaticamente.

### Checkpoint rapidi (restore point)

Comandi disponibili:

- `npm run checkpoint -- "descrizione"` → crea commit+tag locale
- `npm run checkpoint:push -- "descrizione"` → crea commit+tag e li invia su GitHub

Formato tag creato: `checkpoint-YYYYMMDD-HHMM-descrizione`

Per ripristinare codice a un checkpoint:

1. `git fetch --tags`
2. `git checkout <nome-tag>` (verifica)
3. per tornare in produzione: crea branch dal tag e fai merge su `main`

Nota: nella versione CLI attuale usata in questo progetto non è disponibile un comando `hosting:rollback`; il ripristino live è consigliato da Console Firebase.
