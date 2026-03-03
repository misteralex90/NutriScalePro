import { Lock, Sparkles, MessageSquare } from 'lucide-react';
import { BETA_CONFIG } from '../core/betaConfig';

/**
 * Badge Beta da mostrare nell'header
 */
export const BetaBadge = () => {
  if (!BETA_CONFIG.badge.show) return null;
  
  const colors = {
    emerald: 'bg-emerald-500 text-white shadow-emerald-200',
    cyan: 'bg-cyan-500 text-white shadow-cyan-200',
    purple: 'bg-purple-500 text-white shadow-purple-200',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${colors[BETA_CONFIG.badge.color] || colors.emerald} shadow-lg animate-pulse`}>
      <Sparkles size={13} />
      {BETA_CONFIG.badge.text}
    </span>
  );
};

/**
 * Overlay per le sezioni offuscate
 * Quando una sezione è in modalità Beta, viene avvolta in questo componente
 * che applica l'effetto blur e mostra il messaggio
 */
export const BetaOverlay = ({ children, section, variant = 'default' }) => {
  // Se la sezione non deve essere offuscata, renderizza normalmente
  if (!BETA_CONFIG.blurredSections[section]) {
    return children;
  }
  
  // Variante speciale per dashboard operativa completa
  if (section === 'operativeDashboard') {
    return (
      <div className="relative min-h-[400px]">
        {/* Contenuto offuscato */}
        <div className="pointer-events-none select-none absolute inset-0" style={{ filter: 'blur(12px)', opacity: 0.2 }}>
          {children}
        </div>
        
        {/* Overlay con messaggio work in progress */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="max-w-lg text-center space-y-4 mo-card-enter">
            {/* Icona */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-xl shadow-slate-300/50">
                <Lock size={40} className="text-white" />
              </div>
            </div>
            
            {/* Titolo */}
            <div>
              <h3 className="text-2xl font-black text-slate-700">
                Prossimamente
              </h3>
              <p className="text-sm text-slate-500 font-semibold mt-2">
                Disponibile a breve
              </p>
            </div>
            
            {/* Messaggio */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-600 leading-relaxed">
                Questa sezione sarà disponibile nella versione completa di NutriScale Pro.
              </p>
            </div>
            
            {/* Badge Beta */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                <Sparkles size={14} />
                Beta - Work in Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Contenuto offuscato */}
      <div className="pointer-events-none select-none" style={{ filter: 'blur(8px)', opacity: 0.3 }}>
        {children}
      </div>
      
      {/* Overlay con messaggio */}
      <div className="absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-white/80 via-white/90 to-slate-50/95 backdrop-blur-sm rounded-2xl">
        <div className="max-w-md text-center space-y-4 mo-card-enter">
          {/* Icona */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-200/50">
              <Lock size={32} className="text-white" />
            </div>
          </div>
          
          {/* Titolo e sottotitolo */}
          <div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-700">
              {BETA_CONFIG.title}
            </h3>
            <p className="text-sm text-slate-500 font-semibold mt-1">
              {BETA_CONFIG.subtitle}
            </p>
          </div>
          
          {/* Messaggio */}
          <div className="bg-white/60 rounded-xl p-4 border border-slate-200/50 shadow-sm">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {BETA_CONFIG.message}
            </p>
          </div>
          
          {/* CTA Feedback */}
          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-3 border border-emerald-200/50">
            <div className="flex items-start gap-2">
              <MessageSquare size={18} className="text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-700 leading-relaxed text-left">
                {BETA_CONFIG.feedbackCta}
              </p>
            </div>
          </div>
          
          {/* Data scadenza (se presente) */}
          {BETA_CONFIG.expiryDate && (
            <p className="text-xs text-slate-400">
              Beta disponibile fino al {new Date(BETA_CONFIG.expiryDate).toLocaleDateString('it-IT')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Banner Beta da mostrare in cima alla dashboard
 */
export const BetaBanner = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-500 rounded-2xl p-4 md:p-5 text-white shadow-xl shadow-cyan-200/30 mo-card-enter">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
          <Sparkles size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-black">Benvenuto nella versione Beta!</h3>
            <BetaBadge />
          </div>
          <p className="text-sm text-white/90 leading-relaxed">
            Grazie per essere tra i primi a testare NutriScale Pro. Questa è una versione gratuita per testare
            le funzionalità principali e raccogliere il tuo prezioso feedback.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-white/80">
            <MessageSquare size={14} />
            <span>Il tuo feedback è prezioso! Usa la sezione dedicata per condividere suggerimenti.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
