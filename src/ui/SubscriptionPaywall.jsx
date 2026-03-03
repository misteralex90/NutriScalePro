import { useState } from 'react';

const initialBilling = {
  name: '',
  address: '',
  cap: '',
  city: '',
  province: '',
  country: 'Italia',
  taxCode: '',
  vat: '',
  email: '',
  pec: '',
  sdi: '',
  eInvoice: false,
};

export default function SubscriptionPaywall({ onSubmit, plans, defaultPlan }) {
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState(defaultPlan || plans[0]?.id || '');
  const [billing, setBilling] = useState(initialBilling);
  const [error, setError] = useState('');

  const handleBillingChange = (field, value) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
  };

  const validateBilling = () => {
    if (!billing.name || !billing.address || !billing.cap || !billing.city || !billing.province || !billing.country || !billing.email) {
      return 'Compila tutti i campi obbligatori.';
    }
    if (!billing.vat && !billing.taxCode) {
      return 'Inserisci almeno Codice Fiscale o Partita IVA.';
    }
    if (billing.eInvoice && !billing.pec && !billing.sdi) {
      return 'Per fattura elettronica inserisci almeno PEC o SDI.';
    }
    return '';
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const err = validateBilling();
      if (err) {
        setError(err);
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit({ plan, billing });
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-xl font-bold mb-4 text-cyan-900">Abbonamento e pagamento</h2>
      {step === 1 && (
        <div>
          <h3 className="font-semibold mb-2">Scegli piano</h3>
          <div className="space-y-2 mb-4">
            {plans.map((p) => (
              <label key={p.id} className="flex items-center gap-2">
                <input type="radio" name="plan" value={p.id} checked={plan === p.id} onChange={() => setPlan(p.id)} />
                <span>{p.label} — {p.price}€</span>
                {p.promo && <span className="text-xs text-emerald-600 ml-2">{p.promo}</span>}
              </label>
            ))}
          </div>
          <button className="w-full py-3 bg-cyan-900 text-white rounded font-bold mt-2" onClick={handleNext}>Continua</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h3 className="font-semibold mb-2">Dati fatturazione</h3>
          <input type="text" placeholder="Intestatario*" value={billing.name} onChange={e => handleBillingChange('name', e.target.value)} className="w-full p-2 border rounded mb-2" />
          <input type="text" placeholder="Indirizzo*" value={billing.address} onChange={e => handleBillingChange('address', e.target.value)} className="w-full p-2 border rounded mb-2" />
          <div className="flex gap-2 mb-2">
            <input type="text" placeholder="CAP*" value={billing.cap} onChange={e => handleBillingChange('cap', e.target.value)} className="w-1/3 p-2 border rounded" />
            <input type="text" placeholder="Città*" value={billing.city} onChange={e => handleBillingChange('city', e.target.value)} className="w-1/3 p-2 border rounded" />
            <input type="text" placeholder="Provincia*" value={billing.province} onChange={e => handleBillingChange('province', e.target.value)} className="w-1/3 p-2 border rounded" />
          </div>
          <input type="text" placeholder="Paese*" value={billing.country} onChange={e => handleBillingChange('country', e.target.value)} className="w-full p-2 border rounded mb-2" />
          <input type="text" placeholder="Codice Fiscale" value={billing.taxCode} onChange={e => handleBillingChange('taxCode', e.target.value)} className="w-full p-2 border rounded mb-2" />
          <input type="text" placeholder="Partita IVA" value={billing.vat} onChange={e => handleBillingChange('vat', e.target.value)} className="w-full p-2 border rounded mb-2" />
          <input type="email" placeholder="Email fatturazione*" value={billing.email} onChange={e => handleBillingChange('email', e.target.value)} className="w-full p-2 border rounded mb-2" />
          <div className="flex gap-2 mb-2">
            <input type="text" placeholder="PEC" value={billing.pec} onChange={e => handleBillingChange('pec', e.target.value)} className="w-1/2 p-2 border rounded" />
            <input type="text" placeholder="SDI" value={billing.sdi} onChange={e => handleBillingChange('sdi', e.target.value)} className="w-1/2 p-2 border rounded" />
          </div>
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={billing.eInvoice} onChange={e => handleBillingChange('eInvoice', e.target.checked)} />
            <span>Fattura elettronica</span>
          </label>
          {error && <div className="bg-red-50 text-red-500 p-2 rounded text-sm mb-2">{error}</div>}
          <div className="flex gap-2 mt-2">
            <button className="w-1/2 py-3 border border-slate-300 text-slate-600 rounded font-bold" onClick={() => setStep(1)}>Indietro</button>
            <button className="w-1/2 py-3 bg-cyan-900 text-white rounded font-bold" onClick={handleNext}>Continua</button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div>
          <h3 className="font-semibold mb-2">Pagamento</h3>
          <p className="mb-4">Conferma la richiesta: l'amministratore vedrà i dati di fatturazione e il tuo eventuale link/istruzioni di pagamento.</p>
          <div className="flex gap-2 mt-2">
            <button className="w-1/2 py-3 border border-slate-300 text-slate-600 rounded font-bold" onClick={() => setStep(2)}>Indietro</button>
            <button className="w-1/2 py-3 bg-emerald-700 text-white rounded font-bold" onClick={handleSubmit}>Conferma richiesta</button>
          </div>
        </div>
      )}
    </div>
  );
}
