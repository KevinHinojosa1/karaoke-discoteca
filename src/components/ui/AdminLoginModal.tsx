import React, { useState } from 'react';
import { X, Lock, ShieldCheck, User, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
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
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Standard credentials check (admin / karaoke2025 or admin / 1234)
      if (
        (username.trim().toLowerCase() === 'admin' && password === 'karaoke2025') ||
        (username.trim().toLowerCase() === 'admin' && password === '1234') ||
        (username.trim().toLowerCase() === 'dj' && password === 'karaoke')
      ) {
        soundManager.playVictoryFanfare();
        setLoading(false);
        onSuccess();
        onClose();
      } else {
        soundManager.playTap();
        setLoading(false);
        setError('Usuario o contraseña incorrectos. (Demo: admin / karaoke2025)');
      }
    }, 450);
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('karaoke2025');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md">
        <LiquidGlassCard variant="elevated" className="p-6 md:p-8 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pastel-lavender/30 via-purple-500/20 to-pastel-pink/20 border border-pastel-lavender/40 flex items-center justify-center shadow-glow-lavender mb-3">
              <ShieldCheck className="w-7 h-7 text-pastel-lavender" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Control de Administrador
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Acceso restringido para el DJ y personal del bar para gestión de cola y consumo.
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-lavender/60 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">
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
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-lavender/60 focus:bg-white/10 transition-all text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <LiquidButton
                type="submit"
                variant="lavender"
                fullWidth
                size="lg"
                loading={loading}
                icon={<Lock className="w-4 h-4" />}
              >
                Ingresar al Panel
              </LiquidButton>
            </div>
          </form>

          {/* Quick Demo Hint */}
          <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Demo: <strong className="text-slate-200">admin</strong> / <strong className="text-slate-200">karaoke2025</strong></span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-pastel-lavender hover:underline flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3" />
              Autocompletar
            </button>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
};
