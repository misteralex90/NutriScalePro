# Modalità Beta - NutriScale Pro

## Come attivare/disattivare la modalità Beta

La modalità Beta è stata implementata per permettere ai nutrizionisti di testare l'applicazione senza mostrare le sezioni relative agli abbonamenti e pagamenti.

### Attivazione

Per attivare la modalità Beta:

1. Apri il file `src/core/betaConfig.js`
2. Imposta `BETA_MODE = true`
3. Salva il file

```javascript
export const BETA_MODE = true;
```

### Disattivazione (versione completa)

Per tornare alla versione completa con tutte le funzionalità:

1. Apri il file `src/core/betaConfig.js`
2. Imposta `BETA_MODE = false`
3. Salva il file

```javascript
export const BETA_MODE = false;
```

## Cosa fa la modalità Beta?

Quando `BETA_MODE = true`:

### Elementi visibili Beta:
- **Badge Beta** nell'header della dashboard nutrizionista
- **Banner Beta** nella parte superiore della dashboard con messaggio di benvenuto
- **Overlay offuscato** sulle sezioni sensibili con messaggio informativo

### Sezioni offuscate (blur):
- ✅ **Abbonamento** - Dettagli piano e scadenza
- ✅ **Richiedi abbonamento** - Form per richiedere abbonamento
- ✅ **Promozioni e referral** - Sistema referral e promozioni
- ✅ **Nota**: Queste sezioni rimangono visibili ma offuscate con un overlay che spiega la natura Beta

### Sezioni evidenziate:
- ⭐ **Feedback e suggerimenti** - Include un avviso che invita i nutrizionisti a condividere feedback

### Elementi nascosti:
- ⚠️ **Warning "Abbonamento non attivo"** - Non viene mostrato in modalità Beta

## Personalizzazione

Puoi personalizzare il comportamento e i messaggi della modalità Beta modificando l'oggetto `BETA_CONFIG` in `src/core/betaConfig.js`:

```javascript
export const BETA_CONFIG = {
  title: 'Versione Beta',
  subtitle: 'Prova gratuita a tempo limitato',
  message: `Il tuo messaggio personalizzato...`,
  feedbackCta: 'Invito all\'azione per il feedback',
  
  // Attiva/disattiva singole sezioni
  blurredSections: {
    subscription: true,
    paymentLinks: true,
    subscriptionRequest: true,
    referrals: true,
    promotions: true,
  },
  
  // Personalizza il badge
  badge: {
    show: true,
    text: 'BETA',
    color: 'emerald', // 'emerald', 'cyan', 'purple'
  },
  
  // Data scadenza (opzionale)
  expiryDate: '2026-04-30',
};
```

## Checkpoint e Ripristino

È stato creato un checkpoint prima di implementare la modalità Beta:
- **Tag**: `checkpoint-20260303-2222-pre-beta-version`

### Per tornare al checkpoint (rimuovere tutte le modifiche Beta):

```powershell
git checkout checkpoint-20260303-2222-pre-beta-version
```

Oppure per creare un nuovo branch dal checkpoint:

```powershell
git checkout -b nome-nuovo-branch checkpoint-20260303-2222-pre-beta-version
```

### Per listare tutti i checkpoint disponibili:

```powershell
git tag -l "checkpoint-*"
```

## File modificati/creati

### File creati:
- `src/core/betaConfig.js` - Configurazione modalità Beta
- `src/ui/BetaComponents.jsx` - Componenti UI per la Beta (BetaBadge, BetaBanner, BetaOverlay)
- `BETA_MODE.md` - Questa documentazione

### File modificati:
- `src/App.jsx` - Integrazione componenti Beta nel dashboard nutrizionista

## Note importanti

⚠️ **Attenzione**: La modalità Beta è solo un'interfaccia visiva. Le funzionalità backend per gli abbonamenti sono sempre attive. In produzione, assicurati di gestire correttamente i permessi lato server.

💡 **Suggerimento**: Dopo aver raccolto i feedback e essere pronti per il rilascio completo, imposta semplicemente `BETA_MODE = false` - non è necessario rimuovere il codice.
