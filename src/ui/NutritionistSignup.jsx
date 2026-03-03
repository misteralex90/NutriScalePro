
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Modal } from '.';

export default function NutritionistSignup({ onSignup, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (!email || !password || !firstName || !lastName) {
        setError('Compila tutti i campi obbligatori.');
        return;
      }
      const result = await onSignup({ email, password, firstName, lastName });
      if (result.ok) {
        setSuccess(result.message);
      } else {
        setError(result.message || 'Errore durante la registrazione.');
      }
    } catch (err) {
      setError(err.message || 'Errore durante la registrazione.');
    }
  };

  // Minimal modal style, animazione bubble, freccia discreta in alto a sinistra
  return (
    <Modal open={true} maxWidth="max-w-xs" onClose={onClose}>
      <div className="relative">
        <button
          type="button"
          aria-label="Torna indietro"
          onClick={onClose}
          className="absolute -left-2 -top-2 p-2 rounded-full text-cyan-700 hover:bg-cyan-50 focus:outline-none transition-all"
          tabIndex={0}
        >
          <ChevronLeft size={22} />
        </button>
        <h2 className="text-lg font-bold mb-2 text-cyan-900 text-center">Iscrizione nutrizionista</h2>
        <form onSubmit={handleSubmit} className="space-y-3 mt-4">
          <div className="flex gap-2">
            <input type="text" placeholder="Nome*" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-1/2 p-2 rounded-lg border border-slate-200 focus:border-cyan-400 text-sm bg-white/80" autoFocus />
            <input type="text" placeholder="Cognome*" value={lastName} onChange={e => setLastName(e.target.value)} className="w-1/2 p-2 rounded-lg border border-slate-200 focus:border-cyan-400 text-sm bg-white/80" />
          </div>
          <input type="email" placeholder="Email*" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 focus:border-cyan-400 text-sm bg-white/80" />
          <input type="password" placeholder="Password*" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 focus:border-cyan-400 text-sm bg-white/80" />
          {error && <div className="bg-red-50 text-red-500 p-2 rounded text-xs text-center animate-pulse">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-2 rounded text-xs text-center animate-pulse">{success}</div>}
          <button type="submit" className="w-full py-2 bg-cyan-900 text-white rounded-lg font-semibold text-sm mt-1 shadow-sm hover:bg-cyan-800 active:scale-[0.98] transition-all">Iscriviti</button>
        </form>
      </div>
    </Modal>
  );
}
