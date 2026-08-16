import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  AlertCircle,
  Sparkles,
  Eye,
  Crown,
  HelpCircle,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';

interface TablePinVerificationProps {
  onSpectatorMode: () => void;
}

export const TablePinVerification: React.FC<TablePinVerificationProps> = ({
  onSpectatorMode,
}) => {
  const { currentTable, activeTableId, unlockTableWithPin } = useKaraoke();

  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    // Focus first digit on mount
    inputRefs[0].current?.focus();
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = digit;
    setPinDigits(newDigits);
    setError('');

    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto submit if all 4 digits filled
    if (digit && index === 3) {
      const fullPin = newDigits.join('');
      if (fullPin.length === 4) {
        submitPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const submitPin = (pinToSubmit: string) => {
    setLoading(true);
    setError('');

    setTimeout(() => {
      const res = unlockTableWithPin(activeTableId, pinToSubmit);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'PIN incorrecto');
        setPinDigits(['', '', '', '']);
        inputRefs[0].current?.focus();
      }
    }, 400);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pinDigits.join('');
    if (fullPin.length < 4) {
      setError('Por favor ingresa los 4 dígitos del PIN.');
      return;
    }
    submitPin(fullPin);
  };

  const handleQuickDemoFill = () => {
    if (currentTable?.pin) {
      const digits = currentTable.pin.split('');
      setPinDigits(digits);
      submitPin(currentTable.pin);
    }
  };

  const tierConfig = currentTable ? TIER_CONFIGS[currentTable.tier] : TIER_CONFIGS.standard;

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <LiquidGlassCard variant="elevated" className="p-6 md:p-8 text-center relative">
        {/* Shield Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-pastel-lavender/30 via-purple-500/20 to-pastel-pink/20 border border-white/30 flex items-center justify-center text-pastel-lavender shadow-glow-lavender mb-4">
          <ShieldCheck className="w-8 h-8 text-pastel-lavender" />
        </div>

        {/* Table Identity */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-semibold mb-2">
          {currentTable?.tier === 'vip_100' ? (
            <Crown className="w-3.5 h-3.5 text-amber-300" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-pastel-lavender" />
          )}
          <span>{currentTable?.name || `Mesa ${activeTableId}`}</span>
          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${tierConfig.badgeBg}`}>
            {tierConfig.shortLabel}
          </span>
        </div>

        <h3 className="text-xl font-black text-white tracking-tight">
          Verificación de Mesa
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
          Ingresa el <strong>PIN de 4 dígitos</strong> impreso en el atril de tu mesa o en el ticket del bar para autorizar este celular.
        </p>

        {/* Error Feedback */}
        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Digit Inputs */}
        <form onSubmit={handleFormSubmit} className="mt-6 space-y-5">
          <div className="flex items-center justify-center gap-3">
            {pinDigits.map((d, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-14 h-16 text-center text-2xl font-black rounded-2xl bg-white/5 border-2 border-white/20 text-white focus:outline-none focus:border-pastel-lavender focus:bg-white/10 focus:shadow-glow-lavender transition-all"
              />
            ))}
          </div>

          <LiquidButton
            type="submit"
            variant="lavender"
            size="lg"
            fullWidth
            loading={loading}
            icon={<KeyRound className="w-4 h-4" />}
          >
            Verificar y Vincular Celular
          </LiquidButton>
        </form>

        {/* Spectator Mode Option */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onSpectatorMode}
            className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors font-medium"
          >
            <Eye className="w-3.5 h-3.5 text-pastel-sky" />
            <span>Continuar como Espectador (Solo ver cola en vivo)</span>
          </button>

          {/* Quick Demo Assist */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> PIN físico demo: <strong className="text-pastel-mint">{currentTable?.pin}</strong>
            </span>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-pastel-lavender hover:underline flex items-center gap-1 font-semibold"
            >
              <Sparkles className="w-3 h-3" /> Autocompletar
            </button>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  );
};
