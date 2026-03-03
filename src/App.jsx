import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  LogIn,
  LogOut,
  Megaphone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Unlock,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { Modal, Select } from './ui';
import NutritionistSignup from './ui/NutritionistSignup';
import SubscriptionPaywall from './ui/SubscriptionPaywall';
import { authApi, masterApi, nutritionistApi, publicApi, signupApi } from './core/api';
import {
  ACCOUNT_STATUS,
  ACCOUNT_STATUS_LABELS,
  PLAN,
  PLAN_LABELS,
  PROMOTION_TYPE,
  PUBLIC_RESERVED_SLUGS,
  REQUEST_STATUS,
  ROLES,
} from './core/constants';
import { convertWeight } from './core/foodDatabase';
import { formatDate, isValidDoctorDisplayName } from './core/utils';
import { requestSubscription } from './core/subscriptionRequest';

const SESSION_KEY = 'nutriscale_session';

const getSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const saveSession = (value) => localStorage.setItem(SESSION_KEY, JSON.stringify(value));
const clearSession = () => localStorage.removeItem(SESSION_KEY);

const getCurrentPath = () => {
  const path = window.location.pathname.replace(/\/+$/, '');
  return path || '/';
};

const navigate = (nextPath) => {
  window.history.pushState({}, '', nextPath);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const resolvePublicSlug = (path) => {
  if (path.startsWith('/n/')) {
    const slug = path.split('/').filter(Boolean)[1];
    return slug || null;
  }

  const segments = path.split('/').filter(Boolean);
  if (segments.length !== 1) return null;
  if (PUBLIC_RESERVED_SLUGS.includes(segments[0])) return null;
  return segments[0];
};

const Badge = ({ children, variant = 'default' }) => {
  const classes = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-cyan-100 text-cyan-700',
  };

  return <span className={`text-xs px-2 py-1 rounded-full font-semibold ${classes[variant]}`}>{children}</span>;
};

const Card = ({ title, icon, children, actions }) => (
  <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md hover:border-slate-300">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h3 className="font-bold text-slate-800 flex items-center gap-2">{icon}{title}</h3>
      <div>{actions}</div>
    </div>
    {children}
  </section>
);

const inputStyle =
  'w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 outline-none text-sm';

const btnPrimary = 'px-4 py-2.5 rounded-xl bg-cyan-900 text-white text-sm font-semibold hover:bg-cyan-800 active:scale-[0.97] shadow-sm hover:shadow-md transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]';
const btnOutline = 'px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:border-cyan-400 hover:text-cyan-800 hover:bg-cyan-50/50 active:scale-[0.97] transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]';
const btnSmOutline = 'px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:border-cyan-400 hover:text-cyan-800 hover:bg-cyan-50/50 active:scale-[0.97] transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]';
const btnSmDanger = 'px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 active:scale-[0.97] transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]';
const btnSmSuccess = 'px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-[0.97] transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]';

/* Modal imported from ./ui */

const planOptions = [PLAN.TRIAL_14, PLAN.MONTH_1, PLAN.MONTH_12];

const Landing = ({ onLogin, showLogin = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submitLogin = (e) => {
    e.preventDefault();
    try {
      const session = authApi.loginNutritionist({ email, password });
      onLogin(session);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-cyan-800 to-teal-700 flex flex-col items-center justify-center p-6 relative overflow-hidden mo-page-enter">
    {/* Decorative circles */}
    <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full bg-white/5" />
    <div className="absolute bottom-[-100px] left-[-60px] w-[300px] h-[300px] rounded-full bg-white/5" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02]" />

    <div className="relative z-10 text-center max-w-lg w-full mo-card-enter">
      {/* Brand */}
      <div className="mb-2">
        <span className="text-emerald-300 text-sm font-semibold tracking-widest uppercase">Piattaforma Nutrizionisti</span>
      </div>
      <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none">
        Nutri<span className="text-emerald-300">Scale</span><span className="text-white/60 font-light"> Pro</span>
      </h1>
      <p className="text-white/70 mt-4 text-base md:text-lg leading-relaxed">
        Conversione peso alimenti da crudo a cotto e viceversa,<br className="hidden md:block" />
        per i professionisti della nutrizione.
      </p>

      {/* Main CTA */}
      <button
        onClick={() => navigate('/nutritionist/login')}
        className="mt-10 group relative inline-flex items-center gap-3 bg-white text-cyan-900 font-bold text-lg px-10 py-4 rounded-2xl shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        <LogIn size={22} className="text-cyan-700" />
        Accedi come Nutrizionista
      </button>

      {/* Signup CTA */}
      <button
        onClick={() => navigate('/signup')}
        className="mt-3 inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
      >
        <UserPlus size={16} />
        Iscriviti come nutrizionista
      </button>

      {/* Features pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
        {['Conversione Crudo ↔ Cotto', 'Database Alimenti', 'Link Pazienti'].map((f) => (
          <span key={f} className="text-xs bg-white/10 text-white/80 px-3 py-1.5 rounded-full backdrop-blur">{f}</span>
        ))}
      </div>
    </div>

    {/* Hidden master link */}
    <button
      onClick={() => navigate('/master/login')}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 hover:text-white/60 text-[11px] transition-colors duration-300 tracking-wide"
    >
      •&nbsp;&nbsp;Admin&nbsp;&nbsp;•
    </button>

    {/* Login modal overlay — no page change */}
    <Modal open={showLogin} onClose={() => navigate('/')} maxWidth="max-w-md">
      <form onSubmit={submitLogin}>
        <div className="flex justify-center mb-5">
          <img src="/logo.png" alt="NutriScale Pro" className="h-20 w-20 object-contain" />
        </div>
        <h1 className="text-2xl font-black text-cyan-900 text-center">
          Nutri<span className="text-emerald-600">Scale</span> <span className="text-cyan-900/50 font-light">Pro</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 text-center">Accedi alla tua area nutrizionista</p>
        <div className="space-y-3 mt-6">
          <input data-autofocus value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} placeholder="Email" type="email" required />
          <input value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} placeholder="Password" type="password" required />
        </div>
        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        <button className="w-full mt-6 py-3 rounded-xl bg-cyan-900 text-white font-semibold text-base hover:bg-cyan-800 active:scale-[0.98] transition-all shadow-lg shadow-cyan-900/30">Accedi</button>
      </form>
    </Modal>
  </div>
  );
};

const PublicConverter = ({ slug }) => {
  const [state, setState] = useState({ loading: true, error: '', payload: null });
  const [weight, setWeight] = useState(100);
  const [rawToCooked, setRawToCooked] = useState(true);
  const [query, setQuery] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [accessError, setAccessError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    try {
      const payload = publicApi.getTenantPage(slug);
      setState({ loading: false, payload, error: '' });
    } catch (error) {
      setState({ loading: false, payload: null, error: error.message });
    }
  }, [slug]);

  useEffect(() => {
    if (!state.payload) return;
    setIsUnlocked(!state.payload.requiresPatientCode);
    setCodeInput('');
    setAccessError('');
  }, [state.payload]);

  const filtered = useMemo(() => {
    if (!state.payload?.foodDatabase) return [];
    return state.payload.foodDatabase.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  }, [state.payload, query]);

  if (state.loading) return <div className="min-h-screen bg-slate-50 p-8">Caricamento...</div>;
  if (state.error) return <div className="min-h-screen bg-slate-50 p-8 text-red-600">{state.error}</div>;

  const { tenant, isAccessActive, renewalUrl, blockReason, requiresPatientCode, patientWelcomeMessage, globalPaymentLinks = [] } = state.payload;

  if (!isAccessActive) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <Lock className="mx-auto text-red-500" />
          <h1 className="text-xl font-bold mt-2">Accesso non attivo</h1>
          <p className="text-sm text-slate-500 mt-2">Il servizio del nutrizionista è {blockReason === 'bloccato' ? 'temporaneamente bloccato' : 'scaduto'}.</p>
          {globalPaymentLinks.length > 0 ? (
            <div className="mt-4 space-y-2 text-left">
              <p className="text-xs font-semibold text-slate-500">Link pagamento disponibili</p>
              {globalPaymentLinks.map((item) => (
                <a key={item.id} href={item.url} className="inline-flex items-center gap-2 text-cyan-800 text-sm font-semibold" target="_blank" rel="noreferrer">
                  {item.label} <ExternalLink size={13} />
                </a>
              ))}
            </div>
          ) : renewalUrl ? (
            <a href={renewalUrl} className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-xl bg-cyan-900 text-white" target="_blank" rel="noreferrer">
              Rinnova <ExternalLink size={14} />
            </a>
          ) : (
            <p className="text-sm mt-4">Contatta il tuo nutrizionista per il rinnovo.</p>
          )}
        </div>
      </div>
    );
  }

  if (requiresPatientCode && !isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center mo-page-enter">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 text-center">
          <img src={tenant.logoUrl || '/logo.png'} alt="Logo" className="w-14 h-14 mx-auto rounded-full border border-slate-200 bg-white object-cover" />
          <h1 className="text-xl font-black text-cyan-900 mt-3">{tenant.displayName}</h1>
          <p className="text-sm text-slate-500 mt-2">{patientWelcomeMessage}</p>

          <form
            className="mt-5 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              try {
                publicApi.verifyPatientAccessCode(slug, codeInput);
                setIsUnlocked(true);
                setAccessError('');
              } catch (err) {
                setAccessError(err.message);
              }
            }}
          >
            <input
              className={inputStyle}
              type="password"
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
              placeholder="Inserisci codice accesso"
              required
            />
            {accessError && <p className="text-xs text-red-600">{accessError}</p>}
            <button className="w-full py-2.5 rounded-xl bg-cyan-900 text-white font-semibold">Entra nel calcolatore</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 mo-page-enter">
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto p-4 flex items-center gap-3">
          <img src={tenant.logoUrl || '/logo.png'} alt="Logo" className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white" />
          <div>
            <h1 className="font-black text-cyan-900 text-lg">{tenant.displayName}</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Conversione alimenti crudo ↔ cotto</p>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
        <Card title="Calcolatore" icon={<RefreshCw size={17} />}>
          <div className="grid md:grid-cols-3 gap-3">
            <input type="number" min="0" value={weight} onChange={(event) => setWeight(Number(event.target.value || 0))} className={inputStyle} />
            <button onClick={() => setRawToCooked(true)} className={`rounded-xl py-2.5 font-semibold border ${rawToCooked ? 'bg-cyan-900 text-white border-cyan-900' : 'bg-white border-slate-300'}`}>Crudo → Cotto</button>
            <button onClick={() => setRawToCooked(false)} className={`rounded-xl py-2.5 font-semibold border ${!rawToCooked ? 'bg-cyan-900 text-white border-cyan-900' : 'bg-white border-slate-300'}`}>Cotto → Crudo</button>
          </div>
          <div className="mt-3 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputStyle} pl-9`} placeholder="Cerca alimento" />
          </div>
        </Card>

        <div className="space-y-3">
          {filtered.map((food) => (
            <div key={food.name} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-center gap-3">
                <div>
                  <h4 className="font-bold">{food.name}</h4>
                  <p className="text-xs text-slate-500">{food.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Risultato</div>
                  <div className="text-2xl font-black text-cyan-900">{convertWeight({ weight, factor: food.factors[Object.keys(food.factors)[0]], rawToCooked })}g</div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {Object.entries(food.factors).map(([method, factor]) => (
                  <span key={method} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{method}: x{factor}</span>
                ))}
              </div>
              {food.tip && <p className="text-xs text-amber-700 bg-amber-50 mt-3 p-2 rounded-lg">{food.tip}</p>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

/* ── Expandable Nutritionist Row ── */
const NutritionistRow = ({ user, tenant, subscription, accountStatus, session, refresh, setError, showPrompt, showConfirm }) => {
  const [expanded, setExpanded] = useState(false);

  const statusVariantMap = {
    [ACCOUNT_STATUS.ACTIVE]: 'success',
    [ACCOUNT_STATUS.PENDING_APPROVAL]: 'warning',
    [ACCOUNT_STATUS.APPROVED_NO_SUBSCRIPTION]: 'info',
    [ACCOUNT_STATUS.EXPIRED]: 'danger',
    [ACCOUNT_STATUS.SUSPENDED]: 'danger',
    [ACCOUNT_STATUS.REJECTED]: 'danger',
    [ACCOUNT_STATUS.PAYMENT_REQUIRED]: 'warning',
  };
  const statusLabel = ACCOUNT_STATUS_LABELS[accountStatus] ?? accountStatus;
  const statusVariant = statusVariantMap[accountStatus] ?? 'default';
  const isActive = accountStatus === ACCOUNT_STATUS.ACTIVE;
  const isPending = accountStatus === ACCOUNT_STATUS.PENDING_APPROVAL;
  const canActivate = [ACCOUNT_STATUS.APPROVED_NO_SUBSCRIPTION, ACCOUNT_STATUS.EXPIRED, ACCOUNT_STATUS.SUSPENDED, ACCOUNT_STATUS.PAYMENT_REQUIRED].includes(accountStatus);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${expanded ? 'border-cyan-300 shadow-lg shadow-cyan-100/50 bg-white' : 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:shadow-sm'}`}>
      {/* Summary row — always visible */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar initial */}
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white ${isActive ? 'bg-cyan-700' : isPending ? 'bg-amber-500' : 'bg-slate-400'}`}>
          {tenant.displayName.replace('Dott. ', '').charAt(0).toUpperCase()}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm truncate">{tenant.displayName}</span>
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </div>
          <p className="text-xs text-slate-500 truncate">/{tenant.slug} · {user.email} · Piano: {PLAN_LABELS[subscription?.plan] ?? '—'}</p>
        </div>
        {/* Expiry + chevron */}
        <div className="shrink-0 flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block">Scade: {formatDate(subscription?.endAt)}</span>
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Expanded details — slide open with spring */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 mo-expand-enter"
        >
          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-slate-400 font-medium">Email</p>
              <p className="text-slate-700 font-semibold mt-0.5 truncate">{user.email}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-slate-400 font-medium">Piano</p>
              <p className="text-slate-700 font-semibold mt-0.5">{PLAN_LABELS[subscription?.plan] ?? '—'}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-slate-400 font-medium">Scadenza</p>
              <p className="text-slate-700 font-semibold mt-0.5">{formatDate(subscription?.endAt)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-slate-400 font-medium">Slug</p>
              <p className="text-slate-700 font-semibold mt-0.5">/{tenant.slug}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {/* Activation buttons — only for accounts that can be activated */}
            {canActivate && (
              <>
                <button className={btnSmSuccess} onClick={() => { try { masterApi.activateSubscription(session, tenant.id, PLAN.TRIAL_14); refresh(); } catch (err) { setError(err.message); } }}>
                  <span className="inline-flex items-center gap-1"><Clock size={13} /> Trial 14gg</span>
                </button>
                <button className={btnSmSuccess} onClick={() => { try { masterApi.activateSubscription(session, tenant.id, PLAN.MONTH_1); refresh(); } catch (err) { setError(err.message); } }}>
                  <span className="inline-flex items-center gap-1"><Check size={13} /> Attiva 1 mese</span>
                </button>
                <button className={btnSmSuccess} onClick={() => { try { masterApi.activateSubscription(session, tenant.id, PLAN.MONTH_12); refresh(); } catch (err) { setError(err.message); } }}>
                  <span className="inline-flex items-center gap-1"><Check size={13} /> Attiva 12 mesi</span>
                </button>
              </>
            )}
            {isActive && (
              <>
                <Select
                  className="w-auto min-w-[140px]"
                  placeholder="Aggiorna piano"
                  options={planOptions.map((plan) => ({ value: plan, label: PLAN_LABELS[plan] }))}
                  value=""
                  onChange={(val) => { if (!val) return; masterApi.setSubscription(session, tenant.id, { plan: val, activate: true }); refresh(); }}
                />
                <input className={`${inputStyle} w-auto min-w-[150px]`} type="date" onBlur={(e) => e.target.value && masterApi.setSubscription(session, tenant.id, { manualEndAt: e.target.value, activate: true })} placeholder="Scadenza" />
              </>
            )}
            {!isPending && (
              <button className={btnSmOutline} onClick={() => { masterApi.blockTenant(session, tenant.id, !tenant.isBlocked); refresh(); }}>
                {tenant.isBlocked ? <span className="inline-flex items-center gap-1"><Unlock size={13} /> Sblocca</span> : <span className="inline-flex items-center gap-1"><Lock size={13} /> Blocca</span>}
              </button>
            )}
            <button className={btnSmOutline} onClick={async () => {
              const next = await showPrompt('Nuovo nome visualizzato (formato: Dott. Nome Cognome)', tenant.displayName);
              if (!next) return;
              try { masterApi.updateNutritionist(session, tenant.id, { displayName: next }); refresh(); } catch (err) { setError(err.message); }
            }}>Modifica nome</button>
            <button className={`${btnSmDanger} inline-flex items-center gap-1`} onClick={async () => {
              if (await showConfirm('Eliminare nutrizionista?')) { masterApi.deleteNutritionist(session, tenant.id); refresh(); }
            }}><Trash2 size={13} /> Elimina</button>

          </div>
        </div>
      )}
    </div>
  );
};

const MasterDashboard = ({ session, onLogout }) => {
  const [message, setMessage] = useState('');
  const [announcement, setAnnouncement] = useState({ title: '', body: '' });
  const [createForm, setCreateForm] = useState({
    displayName: 'Dott. Nome Cognome',
    email: '',
    password: '',
    plan: PLAN.TRIAL_14,
  });
  const [paymentLinkDraft, setPaymentLinkDraft] = useState({ label: '', url: '' });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  // Fix: define subscriptionActive for Paywall section (avoid crash)
  const subscriptionActive = data && data.subscription && data.subscription.status === 'active';

  const showPrompt = useCallback(async (messageText, defaultValue = '') => {
    const value = window.prompt(messageText, defaultValue);
    return value;
  }, []);

  const showConfirm = useCallback(async (messageText) => {
    return window.confirm(messageText);
  }, []);

  const refresh = useCallback(() => {
    try {
      setData(masterApi.getDashboard(session));
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!data) {
    return <div className="p-8">{error || 'Caricamento dashboard MASTER...'}</div>;
  }

  // Fix: fallback to empty array if undefined
  data.notifications = Array.isArray(data.notifications) ? data.notifications : [];
  data.referrals = Array.isArray(data.referrals) ? data.referrals : [];

  const slotsPromo = data.promotions.find((promo) => promo.type === PROMOTION_TYPE.LIMITED_SLOTS_DISCOUNT);
  const freeMonthPromo = data.promotions.find((promo) => promo.type === PROMOTION_TYPE.FREE_MONTH_REFERRAL);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 mo-page-enter">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl font-black text-cyan-900 flex items-center gap-2"><Shield size={20} /> Dashboard MASTER</h1>
          <div className="flex gap-2">
            <button onClick={refresh} className={btnOutline}>Aggiorna</button>
            <button onClick={onLogout} className={`${btnPrimary} flex items-center gap-1`}><LogOut size={14} /> Esci</button>
          </div>
        </div>

        <Card title="Nuovo Nutrizionista" icon={<UserPlus size={16} />}>
          <div className="grid md:grid-cols-5 gap-2">
            <input className={inputStyle} value={createForm.displayName} onChange={(event) => setCreateForm((prev) => ({ ...prev, displayName: event.target.value }))} placeholder="Dott. Nome Cognome" />
            <input className={inputStyle} value={createForm.email} onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email login" />
            <input className={inputStyle} value={createForm.password} onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))} placeholder="Password" />
            <Select
              options={planOptions.map((plan) => ({ value: plan, label: PLAN_LABELS[plan] }))}
              value={createForm.plan}
              onChange={(val) => setCreateForm((prev) => ({ ...prev, plan: val }))}
            />
            <button
              className={btnPrimary}
              onClick={async () => {
                if (!createForm.email || !createForm.password) return;
                if (!(await showConfirm(`Creare nutrizionista ${createForm.displayName}?`))) return;
                try {
                  masterApi.createNutritionist(session, createForm);
                  setCreateForm({ displayName: 'Dott. Nome Cognome', email: '', password: '', plan: PLAN.TRIAL_14 });
                  refresh();
                } catch (createError) {
                  setError(createError.message);
                }
              }}
            >
              Crea
            </button>
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </Card>

        {/* Pending signups — approval queue */}
        {data.pendingSignups.length > 0 && (
          <Card title={`Richieste iscrizione (${data.pendingSignups.length})`} icon={<ClipboardList size={16} />}>
            <div className="space-y-2">
              {data.pendingSignups.map(({ user, tenant }) => (
                <div key={tenant.id} className="border border-amber-200 bg-amber-50/50 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-slate-800 truncate">{tenant.displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email} · /{tenant.slug}</p>
                    <p className="text-[11px] text-slate-400">{formatDate(tenant.createdAt)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className={btnSmSuccess} onClick={() => { try { masterApi.approveSignup(session, tenant.id); refresh(); } catch (err) { setError(err.message); } }}>
                      <span className="inline-flex items-center gap-1"><Check size={13} /> Approva</span>
                    </button>
                    <button className={btnSmDanger} onClick={async () => {
                      const reason = await showPrompt('Motivo rifiuto (opzionale)', '');
                      if (reason === null) return;
                      try { masterApi.rejectSignup(session, tenant.id, reason || ''); refresh(); } catch (err) { setError(err.message); }
                    }}>
                      <span className="inline-flex items-center gap-1"><XCircle size={13} /> Rifiuta</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title="Nutrizionisti" icon={<Building2 size={16} />}>
          <div className="space-y-2">
            {data.nutritionists.filter((n) => n.accountStatus !== ACCOUNT_STATUS.PENDING_APPROVAL).length === 0 && <p className="text-sm text-slate-500">Nessun nutrizionista registrato.</p>}
            {data.nutritionists
              .filter((n) => n.accountStatus !== ACCOUNT_STATUS.PENDING_APPROVAL)
              .map(({ user, tenant, subscription, accountStatus: acctStatus }) => (
                <NutritionistRow
                  key={tenant.id}
                  user={user}
                  tenant={tenant}
                  subscription={subscription}
                  accountStatus={acctStatus}
                  session={session}
                  refresh={refresh}
                  setError={setError}
                  showPrompt={showPrompt}
                  showConfirm={showConfirm}
                />
              ))}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Promozioni" icon={<CircleDollarSign size={16} />}>
            <div className="space-y-3 text-sm">
              <div className="border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <strong>Porta un amico (soglia limitata)</strong>
                  <input type="checkbox" checked={Boolean(slotsPromo?.active)} onChange={(event) => { masterApi.setPromotion(session, PROMOTION_TYPE.LIMITED_SLOTS_DISCOUNT, { active: event.target.checked }); refresh(); }} />
                </div>
                <p className="text-slate-500 mt-1">Primi N: 1 mese 5€ · 12 mesi 39€</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <input className={inputStyle} type="number" defaultValue={slotsPromo?.maxDiscountedUsers ?? 20} onBlur={(event) => { masterApi.setPromotion(session, PROMOTION_TYPE.LIMITED_SLOTS_DISCOUNT, { maxDiscountedUsers: Number(event.target.value) || 20 }); refresh(); }} />
                  <input className={inputStyle} type="number" defaultValue={slotsPromo?.slotsVisible ?? 10} onBlur={(event) => { masterApi.setPromotion(session, PROMOTION_TYPE.LIMITED_SLOTS_DISCOUNT, { slotsVisible: Number(event.target.value) || 10 }); refresh(); }} />
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <strong>+1 mese per referral acquistato</strong>
                <input type="checkbox" checked={Boolean(freeMonthPromo?.active)} onChange={(event) => { masterApi.setPromotion(session, PROMOTION_TYPE.FREE_MONTH_REFERRAL, { active: event.target.checked }); refresh(); }} />
              </div>
            </div>
          </Card>

          <Card title="Link pagamento globali" icon={<ExternalLink size={16} />}>
            <div className="space-y-2">
              <div className="grid md:grid-cols-2 gap-2">
                <input
                  className={inputStyle}
                  placeholder="Etichetta (es. Stripe 1 mese)"
                  value={paymentLinkDraft.label}
                  onChange={(event) => setPaymentLinkDraft((prev) => ({ ...prev, label: event.target.value }))}
                />
                <input
                  className={inputStyle}
                  placeholder="https://..."
                  value={paymentLinkDraft.url}
                  onChange={(event) => setPaymentLinkDraft((prev) => ({ ...prev, url: event.target.value }))}
                />
              </div>
              <button
                className={btnPrimary}
                onClick={() => {
                  const next = [...(data.globalPaymentLinks ?? [])];
                  next.push({ id: `pay-${Date.now()}`, label: paymentLinkDraft.label.trim(), url: paymentLinkDraft.url.trim() });
                  try {
                    masterApi.setGlobalPaymentLinks(session, next);
                    setPaymentLinkDraft({ label: '', url: '' });
                    refresh();
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                Aggiungi link globale
              </button>

              <div className="space-y-1 max-h-40 overflow-auto pr-1">
                {(data.globalPaymentLinks ?? []).length === 0 && <p className="text-sm text-slate-500">Nessun link globale configurato.</p>}
                {(data.globalPaymentLinks ?? []).map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-2 flex items-center justify-between gap-2">
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-800 font-semibold truncate">{item.label}</a>
                    <button
                      className={btnSmDanger}
                      onClick={() => {
                        try {
                          masterApi.setGlobalPaymentLinks(session, (data.globalPaymentLinks ?? []).filter((link) => link.id !== item.id));
                          refresh();
                        } catch (err) {
                          setError(err.message);
                        }
                      }}
                    >
                      Rimuovi
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Comunicazioni" icon={<Megaphone size={16} />}>
            <div className="space-y-2">
              <input className={inputStyle} placeholder="Titolo" value={announcement.title} onChange={(event) => setAnnouncement((prev) => ({ ...prev, title: event.target.value }))} />
              <textarea className={inputStyle} rows={3} placeholder="Messaggio" value={announcement.body} onChange={(event) => setAnnouncement((prev) => ({ ...prev, body: event.target.value }))} />
              <button className={btnPrimary} onClick={async () => {
                if (!announcement.title || !announcement.body) return;
                masterApi.createAnnouncement(session, announcement);
                setAnnouncement({ title: '', body: '' });
                refresh();
              }}>Invia comunicazione</button>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Richieste abbonamento" icon={<Calendar size={16} />}>
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {data.pendingRequests.length === 0 && <p className="text-sm text-slate-500">Nessuna richiesta pendente.</p>}
              {data.pendingRequests.map((request) => (
                <div key={request.id} className="border border-slate-200 rounded-xl p-3">
                  <p className="text-sm font-semibold">Tenant: {request.tenantId}</p>
                  <p className="text-xs text-slate-500">Piano richiesto: {PLAN_LABELS[request.plan]}</p>
                  <p className="text-xs text-slate-500">{request.billing.firstName} {request.billing.lastName} · {request.billing.contactEmail}</p>
                  <div className="flex gap-2 mt-2">
                    <button className={btnSmSuccess} onClick={() => { masterApi.decideSubscriptionRequest(session, request.id, REQUEST_STATUS.APPROVED); refresh(); }}>Approva</button>
                    <button className={btnSmDanger} onClick={async () => { const reason = await showPrompt('Motivo rifiuto (opzionale)', ''); if (reason === null) return; masterApi.decideSubscriptionRequest(session, request.id, REQUEST_STATUS.REJECTED, reason || ''); refresh(); }}>Rifiuta</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Referral convertiti" icon={<Users size={16} />}>
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {data.referrals.length === 0 && <p className="text-sm text-slate-500">Nessun referral.</p>}
              {data.referrals.map((ref) => (
                <div key={ref.id} className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{ref.firstName} {ref.lastName}</p>
                    <p className="text-xs text-slate-500">{ref.email}</p>
                  </div>
                  {ref.status === 'purchased' ? <Badge variant="success">Acquistato</Badge> : <button className={`${btnSmOutline} inline-flex items-center gap-1`} onClick={async () => { if (await showConfirm(`Confermi acquisto per ${ref.firstName} ${ref.lastName}?`)) { masterApi.markReferralPurchased(session, ref.id); refresh(); } }}><Check size={12} /> Segna acquisto</button>}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card title="Notifiche" icon={<Bell size={16} />}>
            <div className="space-y-2 max-h-56 overflow-auto">
              {data.notifications.length === 0 && <p className="text-sm text-slate-500">Nessuna notifica.</p>}
              {data.notifications.map((notification) => (
                <button key={notification.id} className="w-full text-left border border-slate-200 rounded-xl p-3 bg-slate-50" onClick={() => { nutritionistApi.markNotificationRead(session, notification.id); refresh(); }}>
                  <p className="font-semibold text-sm">{notification.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{notification.body}</p>
                  <p className="text-[11px] text-slate-400 mt-2">{formatDate(notification.createdAt)}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Comunicazioni MASTER" icon={<Megaphone size={16} />}>
            <div className="space-y-2 max-h-56 overflow-auto">
              {data.announcements.map((messageItem) => (
                <article key={messageItem.id} className="border border-slate-200 rounded-xl p-3">
                  <h4 className="font-semibold text-sm">{messageItem.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{messageItem.body}</p>
                </article>
              ))}
            </div>
          </Card>

          <Card title="Feedback nutrizionisti" icon={<Megaphone size={16} />}>
            <div className="space-y-2 max-h-56 overflow-auto">
              {(data.feedbacks ?? []).length === 0 && <p className="text-sm text-slate-500">Nessun feedback ricevuto.</p>}
              {(data.feedbacks ?? []).map((item) => (
                <article key={item.id} className="border border-slate-200 rounded-xl p-3">
                  <h4 className="font-semibold text-sm">{item.subject}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.nutritionistName} · {item.nutritionistEmail}</p>
                  <p className="text-xs text-slate-600 mt-2">{item.body}</p>
                  <p className="text-[11px] text-slate-400 mt-2">{formatDate(item.createdAt)}</p>
                </article>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-1 gap-4">
          <Card title="Paywall" icon={<Plus size={16} />}>
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              <p>Stato: {subscriptionActive ? <Badge variant="success">Attivo</Badge> : <Badge variant="danger">Non attivo</Badge>}</p>
              <p>Scadenza: <strong>{data.subscription && data.subscription.endAt ? formatDate(data.subscription.endAt) : '—'}</strong></p>
              <p>Prezzi correnti: 1 mese <strong>{data.currentPrices?.month1 ?? '—'}€</strong> · 12 mesi <strong>{data.currentPrices?.month12 ?? '—'}€</strong></p>
              {(data.globalPaymentLinks ?? []).length > 0 ? (
                <div className="space-y-1">
                  {(data.globalPaymentLinks ?? []).map((item) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="inline-flex mt-1 items-center gap-2 text-cyan-700 font-semibold">
                      {item.label} <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              ) : <p className="text-slate-500">Nessun link pagamento globale configurato dal MASTER.</p>}
              <div className="mt-6">
                <SubscriptionPaywall
                  plans={[
                    { id: 'month_1', label: '1 mese', price: 9, promo: 'Promo attiva!' },
                    { id: 'month_12', label: '12 mesi', price: 79, promo: '2 mesi gratis' },
                  ]}
                  defaultPlan="month_1"
                  onSubmit={(payload) => {
                    try {
                      requestSubscription(session, payload);
                      setMessage('Richiesta abbonamento inviata!');
                      refresh();
                    } catch (err) {
                      setMessage('Errore: ' + err.message);
                    }
                  }}
                />
              </div>
            </div>
          </Card>
        </div>

        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
};

const NutritionistDashboard = ({ session, onLogout }) => {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('clients');
  const [clientAccessCode, setClientAccessCode] = useState('');
  const [clientWelcomeMessage, setClientWelcomeMessage] = useState('');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackBody, setFeedbackBody] = useState('');
  const [billing, setBilling] = useState({
    firstName: '',
    lastName: '',
    company: '',
    taxCodeOrVat: '',
    address: '',
    country: 'Italia',
    contactEmail: '',
    pecEmail: '',
    sdiCode: '',
  });
  const [requestPlan, setRequestPlan] = useState(PLAN.MONTH_1);
  const [referral, setReferral] = useState({ firstName: '', lastName: '', email: '' });
  const [notes, setNotes] = useState('');

  const refresh = useCallback(() => {
    try {
      setData(nutritionistApi.getDashboard(session));
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!data?.tenant) return;
    setClientAccessCode(data.tenant.patientAccessCode ?? '');
    setClientWelcomeMessage(data.tenant.patientWelcomeMessage ?? '');
  }, [data?.tenant?.id, data?.tenant?.patientAccessCode, data?.tenant?.patientWelcomeMessage]);

  if (!data) {
    return <div className="p-8">{error || 'Caricamento dashboard...'}</div>;
  }

  // Tutto il codice che usa 'data' va DOPO questo controllo!
  data.notifications = Array.isArray(data.notifications) ? data.notifications : [];
  data.referrals = Array.isArray(data.referrals) ? data.referrals : [];
  const subscriptionActive = data.subscription && data.subscription.status === 'active';

  // ...existing code...

  const blockedStatuses = [ACCOUNT_STATUS.SUSPENDED, ACCOUNT_STATUS.REJECTED, ACCOUNT_STATUS.PENDING_APPROVAL];

  if (blockedStatuses.includes(data.accountStatus)) {
    const gateConfig = {
      [ACCOUNT_STATUS.SUSPENDED]: {
        icon: <Lock size={32} className="text-red-500" />,
        title: 'Account sospeso',
        desc: 'Il tuo account è stato temporaneamente sospeso dall\'amministratore. Contatta il supporto.',
        color: 'red',
      },
      [ACCOUNT_STATUS.REJECTED]: {
        icon: <XCircle size={32} className="text-red-500" />,
        title: 'Iscrizione rifiutata',
        desc: 'La richiesta di accesso è stata rifiutata. Contatta l\'amministratore per maggiori informazioni.',
        color: 'red',
      },
      [ACCOUNT_STATUS.PENDING_APPROVAL]: {
        icon: <Clock size={32} className="text-amber-500" />,
        title: 'In attesa di approvazione',
        desc: 'Il tuo account è in revisione. Potrai usare la dashboard dopo l\'approvazione.',
        color: 'amber',
      },
    };
    const gate = gateConfig[data.accountStatus] ?? {
      icon: <Lock size={32} className="text-slate-400" />,
      title: 'Accesso non attivo',
      desc: 'Il tuo account non è attualmente attivo.',
      color: 'slate',
    };

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 mo-page-enter">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm mo-card-enter">
          <div className="flex justify-center mb-4">{gate.icon}</div>
          <h2 className="text-xl font-bold text-slate-800">{gate.title}</h2>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">{gate.desc}</p>

          {data.tenant && (
            <div className="mt-5 bg-slate-50 rounded-xl p-3 text-sm text-left">
              <p className="text-slate-600"><strong>Profilo:</strong> {data.tenant.displayName}</p>
              <p className="text-slate-500 text-xs mt-1">Link pazienti: <span className="font-mono text-slate-400">{data.publicUrl}</span></p>
              <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1"><Lock size={11} /> Il link verrà attivato dopo l'abbonamento</p>
            </div>
          )}

          {/* Notifications */}
          {data.notifications.length > 0 && (
            <div className="mt-5 text-left">
              <p className="text-xs font-semibold text-slate-500 mb-2">Notifiche</p>
              <div className="space-y-1.5 max-h-40 overflow-auto">
                {data.notifications.map((n) => (
                  <div key={n.id} className="border border-slate-200 rounded-lg p-2 text-xs">
                    <p className="font-semibold text-slate-700">{n.title}</p>
                    <p className="text-slate-500 mt-0.5">{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={onLogout} className={`${btnOutline} mt-6`}>
            <span className="inline-flex items-center gap-1"><LogOut size={14} /> Esci</span>
          </button>
        </div>
      </div>
    );
  }

  // const subscriptionActive = data.accountStatus === ACCOUNT_STATUS.ACTIVE; // Già dichiarato sopra
  const visibleSlots = data.promotions.slotsPromo?.slotsVisible ?? 10;
  const maxSlots = data.promotions.slotsPromo?.maxDiscountedUsers ?? 20;
  const usedSlots = data.promotions.slotsPromo?.discountedJoinedCount ?? 0;
  const needsSubscriptionAction = [ACCOUNT_STATUS.APPROVED_NO_SUBSCRIPTION, ACCOUNT_STATUS.EXPIRED, ACCOUNT_STATUS.PAYMENT_REQUIRED].includes(data.accountStatus);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 mo-page-enter">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-cyan-900">Dashboard Nutrizionista</h1>
            <p className="text-sm text-slate-500">Tenant: {data.tenant.displayName}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refresh} className={btnOutline}>Aggiorna</button>
            <button onClick={onLogout} className={`${btnPrimary} flex items-center gap-1`}><LogOut size={14} /> Esci</button>
          </div>
        </div>

        {needsSubscriptionAction && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
            <p className="font-semibold">Abbonamento non attivo</p>
            <p className="mt-1">Puoi comunque scegliere il piano e inviare la richiesta di pagamento dalla sezione “Richiedi abbonamento”.</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-2 inline-flex gap-2 w-fit">
          <button className={`${activeSection === 'clients' ? btnPrimary : btnOutline}`} onClick={() => setActiveSection('clients')}>Gestione clienti</button>
          <button className={`${activeSection === 'dashboard' ? btnPrimary : btnOutline}`} onClick={() => setActiveSection('dashboard')}>Dashboard operativa</button>
        </div>

        {activeSection === 'clients' && <div className="grid lg:grid-cols-2 gap-4">
          <Card title="Profilo pubblico" icon={<Users size={16} />}>
            <div className="space-y-3">
              <img src={data.tenant.logoUrl || '/logo.png'} alt="Logo" className="h-16 w-16 rounded-xl object-cover border border-slate-200" />
              <input className={inputStyle} defaultValue={data.tenant.displayName} onBlur={(event) => {
                const value = event.target.value.trim();
                if (!isValidDoctorDisplayName(value)) {
                  setError('Formato obbligatorio: Dott. Nome Cognome');
                  return;
                }
                try {
                  nutritionistApi.updateBranding(session, { displayName: value });
                  setMessage('Nome aggiornato');
                  refresh();
                } catch (brandingError) {
                  setError(brandingError.message);
                }
              }} placeholder="Dott. Nome Cognome" />

              <label className="block">
                <span className="text-xs text-slate-500">Carica logo (max 1MB, PNG/JPEG/WEBP)</span>
                <div className="relative mt-1">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        try {
                          nutritionistApi.updateBranding(session, {
                            logo: {
                              type: file.type,
                              size: file.size,
                              filename: file.name,
                              dataUrl: reader.result,
                            },
                          });
                          setMessage('Logo aggiornato');
                          refresh();
                        } catch (uploadError) {
                          setError(uploadError.message);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-cyan-400 hover:bg-cyan-50/30 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-cyan-100 text-cyan-700">
                      <Plus size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Scegli file</p>
                      <p className="text-[11px] text-slate-400">PNG, JPEG o WEBP · max 1MB</p>
                    </div>
                  </div>
                </div>
              </label>

              <div className="group relative rounded-2xl bg-gradient-to-r from-cyan-50/80 to-slate-50 border border-cyan-200/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 shrink-0">
                      <Globe size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">Link pubblico pazienti</p>
                      <p className="text-sm text-slate-600 truncate mt-0.5 font-mono">{data.publicUrl}</p>
                    </div>
                  </div>
                  <button
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-900 text-white text-xs font-semibold hover:bg-cyan-800 active:scale-[0.97] shadow-sm transition-all duration-150"
                    onClick={() => { navigator.clipboard?.writeText(data.publicUrl); setMessage('Link copiato!'); setTimeout(() => setMessage(''), 2000); }}
                  >
                    <Copy size={13} /> Copia
                  </button>
                </div>
                {!subscriptionActive && (
                  <p className="text-[11px] text-amber-600 mt-2 flex items-center gap-1">
                    <Lock size={11} /> Il link sarà attivo dopo l'approvazione dell'abbonamento
                  </p>
                )}

                <div className="mt-4 border-t border-slate-200 pt-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Codice di accesso per pazienti (opzionale)</p>
                  <input
                    className={inputStyle}
                    type="password"
                    value={clientAccessCode}
                    onChange={(event) => setClientAccessCode(event.target.value)}
                    placeholder="Imposta codice accesso pazienti (min 4 caratteri)"
                  />
                  <textarea
                    className={inputStyle}
                    rows={2}
                    value={clientWelcomeMessage}
                    onChange={(event) => setClientWelcomeMessage(event.target.value)}
                    placeholder="Messaggio di benvenuto pagina accesso"
                  />
                  <div className="flex gap-2">
                    <button
                      className={btnPrimary}
                      onClick={() => {
                        try {
                          nutritionistApi.updatePatientAccessSettings(session, {
                            accessCode: clientAccessCode,
                            welcomeMessage: clientWelcomeMessage,
                          });
                          setMessage('Impostazioni accesso pazienti salvate');
                          refresh();
                        } catch (settingsError) {
                          setError(settingsError.message);
                        }
                      }}
                    >
                      Salva accesso
                    </button>
                    <button
                      className={btnOutline}
                      onClick={() => {
                        try {
                          nutritionistApi.updatePatientAccessSettings(session, {
                            accessCode: '',
                            welcomeMessage: clientWelcomeMessage,
                          });
                          setClientAccessCode('');
                          setMessage('Accesso diretto ripristinato (senza codice)');
                          refresh();
                        } catch (settingsError) {
                          setError(settingsError.message);
                        }
                      }}
                    >
                      Disattiva codice
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Promozioni e referral" icon={<CircleDollarSign size={16} />}>
            <div className="space-y-3 text-sm">
              {data.promotions.slotsPromo?.active && (
                <div className="border border-slate-200 rounded-xl p-3">
                  <p className="font-semibold">Promo porta un amico (slot limitati)</p>
                  <p className="text-slate-500">Posti agevolati rimasti: {Math.max(maxSlots - usedSlots, 0)} / {maxSlots}</p>
                  <div className="mt-2 grid grid-cols-10 gap-1">
                    {Array.from({ length: visibleSlots }).map((_, index) => (
                      <span key={index} className={`h-3 rounded ${index < Math.min(usedSlots, visibleSlots) ? 'bg-cyan-700' : 'bg-slate-200'}`}></span>
                    ))}
                  </div>
                </div>
              )}

              {data.promotions.freeMonthPromo?.active && <p className="text-slate-700">Promo attiva: <strong>+1 mese gratis</strong> per ogni referral con acquisto confermato.</p>}

              <div className="grid md:grid-cols-4 gap-2">
                <input className={inputStyle} placeholder="Nome" value={referral.firstName} onChange={(event) => setReferral((prev) => ({ ...prev, firstName: event.target.value }))} />
                <input className={inputStyle} placeholder="Cognome" value={referral.lastName} onChange={(event) => setReferral((prev) => ({ ...prev, lastName: event.target.value }))} />
                <input className={inputStyle} placeholder="Email" value={referral.email} onChange={(event) => setReferral((prev) => ({ ...prev, email: event.target.value }))} />
                <button className={btnPrimary} onClick={() => {
                  try {
                    nutritionistApi.addReferral(session, referral);
                    setReferral({ firstName: '', lastName: '', email: '' });
                    setMessage('Referral inserito');
                    refresh();
                  } catch (refError) {
                    setError(refError.message);
                  }
                }}>Inserisci</button>
              </div>

              <div className="space-y-1 max-h-40 overflow-auto pr-1">
                {data.referrals.map((item) => (
                  <div key={item.id} className="border border-slate-200 rounded-lg p-2 flex items-center justify-between">
                    <span className="text-xs">{item.firstName} {item.lastName} · {item.email}</span>
                    <Badge variant={item.status === 'purchased' ? 'success' : 'warning'}>{item.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>}

        {activeSection === 'dashboard' && <>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card title="Abbonamento" icon={<Calendar size={16} />}>
            <div className="space-y-2 text-sm">
              <p>Stato: {subscriptionActive ? <Badge variant="success">Attivo</Badge> : <Badge variant="danger">Non attivo</Badge>}</p>
              <p>Scadenza: <strong>{formatDate(data.subscription.endAt)}</strong></p>
              <p>Prezzi correnti: 1 mese <strong>{data.currentPrices.month1}€</strong> · 12 mesi <strong>{data.currentPrices.month12}€</strong></p>
              {(data.globalPaymentLinks ?? []).length > 0 ? (
                <div className="space-y-1">
                  {(data.globalPaymentLinks ?? []).map((item) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="inline-flex mt-1 items-center gap-2 text-cyan-700 font-semibold">
                      {item.label} <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Nessun link pagamento globale configurato dal MASTER.</p>
              )}
            </div>
          </Card>

          <Card title="Richiedi abbonamento" icon={<Plus size={16} />}>
            <div className="grid md:grid-cols-2 gap-2">
              <input className={inputStyle} placeholder="Nome" value={billing.firstName} onChange={(event) => setBilling((prev) => ({ ...prev, firstName: event.target.value }))} />
              <input className={inputStyle} placeholder="Cognome" value={billing.lastName} onChange={(event) => setBilling((prev) => ({ ...prev, lastName: event.target.value }))} />
              <input className={inputStyle} placeholder="Ragione sociale (opz.)" value={billing.company} onChange={(event) => setBilling((prev) => ({ ...prev, company: event.target.value }))} />
              <input className={inputStyle} placeholder="P.IVA / CF" value={billing.taxCodeOrVat} onChange={(event) => setBilling((prev) => ({ ...prev, taxCodeOrVat: event.target.value }))} />
              <input className={`${inputStyle} md:col-span-2`} placeholder="Indirizzo" value={billing.address} onChange={(event) => setBilling((prev) => ({ ...prev, address: event.target.value }))} />
              <input className={inputStyle} placeholder="Paese" value={billing.country} onChange={(event) => setBilling((prev) => ({ ...prev, country: event.target.value }))} />
              <input className={inputStyle} placeholder="Email/PEC" value={billing.contactEmail} onChange={(event) => setBilling((prev) => ({ ...prev, contactEmail: event.target.value }))} />
              <input className={inputStyle} placeholder="PEC (opz.)" value={billing.pecEmail} onChange={(event) => setBilling((prev) => ({ ...prev, pecEmail: event.target.value }))} />
              <input className={inputStyle} placeholder="SDI (opz.)" value={billing.sdiCode} onChange={(event) => setBilling((prev) => ({ ...prev, sdiCode: event.target.value }))} />
              <Select
                options={planOptions.map((plan) => ({ value: plan, label: PLAN_LABELS[plan] }))}
                value={requestPlan}
                onChange={(val) => setRequestPlan(val)}
              />
              <textarea className={`${inputStyle} md:col-span-2`} rows={2} placeholder="Note" value={notes} onChange={(event) => setNotes(event.target.value)} />
              <button className={`${btnPrimary} py-2.5 md:col-span-2`} onClick={() => {
                try {
                  nutritionistApi.submitSubscriptionRequest(session, { plan: requestPlan, billing, notes });
                  setMessage('Richiesta inviata');
                  refresh();
                } catch (requestError) {
                  setError(requestError.message);
                }
              }}>Invia richiesta</button>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card title="Notifiche" icon={<Bell size={16} />}>
            <div className="space-y-2 max-h-56 overflow-auto">
              {data.notifications.length === 0 && <p className="text-sm text-slate-500">Nessuna notifica.</p>}
              {data.notifications.map((notification) => (
                <button key={notification.id} className="w-full text-left border border-slate-200 rounded-xl p-3 bg-slate-50" onClick={() => { nutritionistApi.markNotificationRead(session, notification.id); refresh(); }}>
                  <p className="font-semibold text-sm">{notification.title}</p>
                  <p className="text-xs text-slate-600 mt-1">{notification.body}</p>
                  <p className="text-[11px] text-slate-400 mt-2">{formatDate(notification.createdAt)}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card title="Comunicazioni MASTER" icon={<Megaphone size={16} />}>
            <div className="space-y-2 max-h-56 overflow-auto">
              {data.announcements.map((messageItem) => (
                <article key={messageItem.id} className="border border-slate-200 rounded-xl p-3">
                  <h4 className="font-semibold text-sm">{messageItem.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{messageItem.body}</p>
                </article>
              ))}
            </div>
          </Card>

          <Card title="Feedback e suggerimenti" icon={<Megaphone size={16} />}>
            <div className="space-y-2">
              <input
                className={inputStyle}
                placeholder="Oggetto"
                value={feedbackSubject}
                onChange={(event) => setFeedbackSubject(event.target.value)}
              />
              <textarea
                className={inputStyle}
                rows={4}
                placeholder="Descrivi la miglioria che vorresti"
                value={feedbackBody}
                onChange={(event) => setFeedbackBody(event.target.value)}
              />
              <button
                className={btnPrimary}
                onClick={() => {
                  try {
                    nutritionistApi.submitFeedback(session, { subject: feedbackSubject, body: feedbackBody });
                    setFeedbackSubject('');
                    setFeedbackBody('');
                    setMessage('Feedback inviato con successo');
                    refresh();
                  } catch (feedbackError) {
                    setError(feedbackError.message);
                  }
                }}
              >
                Invia feedback
              </button>
            </div>
          </Card>
        </div>
        </>}

        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
};

const App = () => {
  const [path, setPath] = useState(getCurrentPath());
  const [session, setSession] = useState(() => getSession());
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    const onChange = () => setPath(getCurrentPath());
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);

  // Plans loaded on demand via internalApi.listPlans()

  const handleLogin = (nextSession) => {
    saveSession(nextSession);
    setSession(nextSession);
    navigate(nextSession.role === ROLES.MASTER ? '/master/dashboard' : '/nutritionist/dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    navigate('/');
  };

  // Public slug resolution
  const publicSlug = resolvePublicSlug(path);
  if (publicSlug) {
    return <PublicConverter slug={publicSlug} />;
  }

  if (path === '/master/login') {
    return (
      <>
        <Landing onLogin={handleLogin} />
        <Modal open={true} onClose={() => navigate('/')} maxWidth="max-w-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                const session = authApi.loginMaster({ email: adminEmail, password: adminPassword });
                handleLogin(session);
              } catch (loginError) {
                setAdminError(loginError.message);
              }
            }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-slate-400" />
              <h1 className="text-lg font-bold text-slate-700">Accesso Admin</h1>
            </div>
            <p className="text-xs text-slate-400 mb-5">Pannello di gestione piattaforma.</p>
            <input
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className={inputStyle}
              placeholder="Email"
              type="email"
              required
            />
            <input
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className={inputStyle}
              placeholder="Password"
              type="password"
              required
            />
            {adminError && <p className="text-xs text-red-600 mt-3">{adminError}</p>}
            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Indietro
              </button>
              <button
                className="flex-1 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                Entra
              </button>
            </div>
          </form>
        </Modal>
      </>
    );
  }

  if (path === '/nutritionist/login') {
    return <Landing showLogin onLogin={handleLogin} />;
  }

  // Mostra la modale di signup come overlay sopra la home
  if (path === '/signup') {
    return <>
      <Landing onLogin={handleLogin} />
      <NutritionistSignup
        onSignup={async (data) => {
          try {
            const result = await signupApi.registerNutritionist(data);
            return result;
          } catch (err) {
            return { ok: false, message: err.message };
          }
        }}
        onClose={() => navigate('/')}
      />
    </>;
  }

  if (path === '/master/dashboard') {
    if (!session || session.role !== ROLES.MASTER) {
      navigate('/master/login');
      return null;
    }
    return <MasterDashboard session={session} onLogout={handleLogout} />;
  }

  if (path === '/nutritionist/dashboard' || path === '/request-subscription') {
    if (!session || session.role !== ROLES.NUTRITIONIST) {
      navigate('/nutritionist/login');
      return null;
    }
    return <NutritionistDashboard session={session} onLogout={handleLogout} />;
  }

  return <Landing onLogin={handleLogin} />;
};

export default App;
