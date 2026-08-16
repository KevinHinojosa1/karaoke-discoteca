import React, { useState, useRef } from 'react';
import { Shield, Sparkles, Mic2 } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface AdminSecretTriggerProps {
  onAdminTrigger: () => void;
  isAdminAuthenticated: boolean;
  onOpenAdminDirectly?: () => void;
}

export const AdminSecretTrigger: React.FC<AdminSecretTriggerProps> = ({
  onAdminTrigger,
  isAdminAuthenticated,
  onOpenAdminDirectly,
}) => {
  const [isAdminButtonRevealed, setIsAdminButtonRevealed] = useState(false);
  const lastClickTimeRef = useRef<number>(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Secret Double-Click gesture with ~300ms window & debounce
  const handleLogoClick = () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;

    if (timeSinceLastClick > 80 && timeSinceLastClick < 400) {
      // Double click confirmed!
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      soundManager.playTap();
      setIsAdminButtonRevealed(true);
      // Auto-hide the secret button after 12 seconds of inactivity if not authenticated
      setTimeout(() => {
        setIsAdminButtonRevealed(false);
      }, 12000);
    } else {
      // Single click recorded
      lastClickTimeRef.current = now;
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      clickTimerRef.current = setTimeout(() => {
        // Just a single click, do nothing
      }, 350);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Brand Logo with Secret Double-Click Gesture */}
      <div
        onClick={handleLogoClick}
        className="group relative cursor-pointer select-none flex items-center gap-2.5 p-1.5 rounded-2xl transition-all duration-300 hover:bg-white/5 active:scale-95"
        title="KARAOKE NIGHT CLUB"
      >
        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-pastel-lavender/30 via-pastel-pink/20 to-pastel-sky/30 border border-white/20 flex items-center justify-center shadow-liquid-sm group-hover:border-white/40 transition-all">
          <Mic2 className="w-5 h-5 text-pastel-lavender group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pastel-pink animate-pulse" />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-pastel-lavender to-pastel-pink bg-clip-text text-transparent">
              KARAOKE
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-pastel-lavender/15 text-pastel-lavender border border-pastel-lavender/25">
              LIVE
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Night Club Digital
          </span>
        </div>
      </div>

      {/* Secret Admin Button: Only revealed after double-clicking the logo or when already authenticated */}
      {(isAdminButtonRevealed || isAdminAuthenticated) && (
        <button
          onClick={() => {
            if (isAdminAuthenticated && onOpenAdminDirectly) {
              onOpenAdminDirectly();
            } else {
              onAdminTrigger();
            }
          }}
          className="animate-in fade-in zoom-in-90 duration-300 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/40 text-xs font-semibold shadow-glow-lavender tap-squish"
        >
          <Shield className="w-3.5 h-3.5 text-pastel-lavender" />
          <span>{isAdminAuthenticated ? 'Panel Admin' : 'Acceso DJ / Admin'}</span>
          <Sparkles className="w-3 h-3 text-pastel-pink animate-spin" style={{ animationDuration: '6s' }} />
        </button>
      )}
    </div>
  );
};
