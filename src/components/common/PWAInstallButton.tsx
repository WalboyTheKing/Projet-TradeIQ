import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Smartphone,
  Tablet,
  Download,
  Share2,
  PlusSquare,
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'header' | 'sidebar' | 'landing';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, isIPad, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  // If app is already installed and opened in standalone mode, hide button
  if (isInstalled) {
    return null;
  }

  // Trigger install flow
  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General prompt for desktop / other browsers
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* HEADER VARIANT */}
      {/* ----------------------------------------------------------------- */}
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-medium transition-all cursor-pointer shadow-sm ${className}`}
          title="Installer l'application sur Android, iPhone ou iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Installer l'App</span>
          <span className="sm:hidden">App</span>
        </button>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SIDEBAR VARIANT */}
      {/* ----------------------------------------------------------------- */}
      {variant === 'sidebar' && (
        <button
          onClick={handleClick}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-mono text-emerald-300 transition-all cursor-pointer group shadow-sm ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Download className="w-3.5 h-3.5 group-hover:animate-bounce" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold text-[11px] leading-tight">Installer TRADEIQ</div>
              <div className="text-[10px] text-slate-400">Android • iPhone • iPad</div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
            PWA
          </span>
        </button>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* LANDING PAGE VARIANT */}
      {/* ----------------------------------------------------------------- */}
      {variant === 'landing' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/40 text-xs font-mono text-slate-200 transition-all cursor-pointer shadow-md ${className}`}
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Installer sur Mobile / iPad</span>
        </button>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* DEFAULT BUTTON VARIANT */}
      {/* ----------------------------------------------------------------- */}
      {variant === 'button' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs font-mono transition-all cursor-pointer shadow-lg shadow-emerald-500/10 ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Installer l'Application</span>
        </button>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* GUIDED INSTALLATION MODAL FOR IOS SAFARI & GENERAL BROWSERS */}
      {/* ----------------------------------------------------------------- */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative space-y-5 text-slate-100">
            {/* Close button */}
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                {isIPad ? <Tablet className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Installer TRADEIQ sur {isIPad ? 'iPad' : isIOS ? 'iPhone (iOS)' : 'votre appareil'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Application fluide en plein écran sans barre d'adresse
                </p>
              </div>
            </div>

            {/* Step by step guide */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold shrink-0 text-xs">
                  1
                </div>
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>Ouvrez dans le navigateur</span>
                    <span className="text-slate-400 font-mono">({isIOS ? 'Safari' : 'Chrome / Edge'})</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Assurez-vous d'être sur la page de TRADEIQ.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold shrink-0 text-xs">
                  2
                </div>
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>Appuyez sur</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                      <Share2 className="w-3 h-3" /> Partager
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    {isIPad
                      ? 'Situé en haut à droite dans la barre d’outils Safari de votre iPad.'
                      : 'Situé en bas de votre écran sur iPhone.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold shrink-0 text-xs">
                  3
                </div>
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>Sélectionnez</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                      <PlusSquare className="w-3 h-3" /> Sur l'écran d'accueil
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Validez en appuyant sur <strong>« Ajouter »</strong> en haut à droite.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Affichage Plein Écran</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Performances Ultra-Rapides</span>
              </div>
            </div>

            {/* Close CTA */}
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-white transition-colors cursor-pointer"
            >
              J'ai compris, fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
