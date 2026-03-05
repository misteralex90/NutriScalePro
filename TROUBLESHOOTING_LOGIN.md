# 🔐 Troubleshooting Login Cross-Device

## Problema
**PC riconosce l'account nutrizionista, ma da smartphone dice "credenziali errate"**

## Cause Identificate e Risolte

### 1. **Mancanza di `await` sulle promise async** ✅ FIXATO
**Problema:** Nel componente Landing, il login veniva fatto senza aspettare la promise.
```javascript
// ❌ PRIMA (Errato)
const session = authApi.loginNutritionist({ email, password });
onLogin(session); // Passa Promise invece del risultato

// ✅ DOPO (Corretto)
const session = await authApi.loginNutritionist({ email, password });
onLogin(session); // Passa il risultato effettivo
```

Su PC la promise si risolveva abbastanza velocemente per non causare problemi visibili. Su smartphone (più lento), la promise non era risolta in tempo prima del passaggio a `onLogin()`, causando errori di sessione non valida.

### 2. **Email non normalizzata** ✅ FIXATO
**Problema:** L'email non veniva normalizzata nel form prima di inviarla, ma solo lato backend.
```javascript
// ✅ ORA: Normalizzazione negli input
onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
```

Questo assicura che spazi accidentali o maiuscole non causino mismatch tra dispositivi.

### 3. **Mancanza di logging** ✅ FIXATO
**Problema:** Era impossibile sapere dove esattamente il login falliva.

**Soluzione:** Aggiunto logging dettagliato ad ogni step del processo di autenticazione:
```
[AUTH:NUTRITIONIST_LOGIN] Inizio login
[AUTH:NUTRITIONIST_LOGIN] Firebase Auth OK (uid: ...)
[AUTH:NUTRITIONIST_LOGIN] Documento utente trovato (role: NUTRITIONIST)
[AUTH:NUTRITIONIST_LOGIN] Tenant trovato (accountStatus: ACTIVE)
[AUTH:NUTRITIONIST_LOGIN] ✅ Login riuscito
```

I log vengono salvati anche su localStorage per debug da smartphone.

## Come Verificare il Problema su Smartphone

### Metodo 1: Console Browser
1. Apri la Developer Console (F12 su Chrome mobile)
2. Esegui: `window.__DEBUG__.getAuthLogs()`
3. Visualizzerai una tabella con tutti i log di autenticazione

### Metodo 2: Console Diretta
Nel browser console di smartphone, i log vengono stampati automaticamente con prefisso `[AUTH:...]`

## Checklist Troubleshooting

Se il problema persiste:

1. **Verifica email identica su entrambi dispositivi**
   - No spazi extra
   - Sostituire eventuali maiuscole con minuscole
   - Esempio: ` Email@GMAIL.com ` → `email@gmail.com`

2. **Verifica in Firestore che l'utente esista**
   - Accedi a: Console Firebase > Firestore Database
   - Collezione: `users`
   - Cerca il documento con `email: "email@gmail.com"`
   - Verifica che `role === "NUTRITIONIST"`

3. **Verifica che il tenant esista**
   - Firestore > Collezione `tenants`
   - Documento con ID = `userData.tenantId`
   - Verifica che esista e che `accountStatus` sia uno di:
     - `ACTIVE`
     - `ACTIVE_PAID`
     - `TRIAL_ACTIVE`
     - (Non `PENDING_APPROVAL` o `REJECTED`)

4. **Svuota cache dell'app mobile**
   - Impostazioni > App > [App Name] > Storage > Clear Cache
   - Oppure disinstalla e reinstalla l'app

5. **Sincronizzazione Firebase**
   - Attendi 1-2 minuti per la sincronizzazione
   - Disconnettiti da WiFi e riconnettiti per forzare refresh

## Miglioramenti Implementati

- ✅ Async/await corretto nei form di login (Landing + Admin)
- ✅ Normalizzazione email negli input
- ✅ Stato di loading durante il login
- ✅ Logging dettagliato in authApiFirebase
- ✅ API di debug su `window.__DEBUG__`
- ✅ Messaggi di errore più specifici

## Debug API Disponibile (Console)

```javascript
// Visualizza tutti i log di autenticazione
window.__DEBUG__.getAuthLogs()

// Cancella i log
window.__DEBUG__.clearAuthLogs()
```

## File Modificati

- `src/core/authApiFirebase.js` - Aggiunto logging e normalizzazione
- `src/App.jsx` - Fixato async/await nei form di login
- `src/main.jsx` - Aggiunta debug API globale

---

**Nota:** Se il problema persiste, controlla i log sia da PC che da smartphone e condividi i risultati di `window.__DEBUG__.getAuthLogs()` per un debug più profondo.
