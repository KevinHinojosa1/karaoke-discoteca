import React, { useState } from 'react';
import { X, Lock, ShieldCheck, User, KeyRound, AlertCircle } from 'lucide-react';
import { LiquidGlassCard } from './LiquidGlassCard';
import { LiquidButton } from './LiquidButton';
import { soundManager } from '../../utils/audio';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Secure master credentials check (admin / karaoke2025 or admin / 1234 or dj / karaoke)
      const u = username.trim().toLowerCase();
      const p = password.trim();

      if (
        (u === 'admin' && p === 'karaoke2025') ||
        (u === 'admin' && p === '1234') ||
        (u === 'admin' && p === 'hinojosa2025') ||
        (u === 'dj' && p === 'karaoke')
      ) {
        soundManager.playVictoryFanfare();
        setLoading(false);
        onSuccess();
        onClose();
      } else {
        soundManager.playTap();
        setLoading(false);
        setError('Credenciales no autorizadas. Acceso exclusivo para el personal de cabina y bar.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-sm">
        <LiquidGlassCard variant="elevated" className="p-6 md:p-7 relative border-purple-500/30">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pastel-lavender/30 via-purple-500/20 to-pastel-pink/20 border border-pastel-lavender/40 flex items-center justify-center shadow-glow-lavender mb-2.5">
              <ShieldCheck className="w-6 h-6 text-pastel-lavender" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              Control de Cabina
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xs">
              Acceso exclusivo para el DJ y personal del local.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario autorizador"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-lavender/60 focus:bg-white/10 transition-all text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-lavender/60 focus:bg-white/10 transition-all text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <LiquidButton
                type="submit"
                variant="lavender"
                fullWidth
                size="md"
                loading={loading}
                icon={<Lock className="w-4 h-4" />}
              >
                Ingresar a Cabina
              </LiquidButton>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </div>
  );
};
