import React, { useState } from 'react';
import {
  QrCode,
  DollarSign,
  Music,
  Users,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from './LiquidGlassCard';
import { LiquidButton } from './LiquidButton';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';
import { signTableUrl } from '../../utils/security';

interface MyTableInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyTableInfoModal: React.FC<MyTableInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTable, isTableAuthenticated } = useKaraoke();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !currentTable) return null;

  const config = TIER_CONFIGS[currentTable.tier];
  const totalQuota = config.maxSongs + currentTable.extraQuotaBonus;
  const remaining = Math.max(0, totalQuota - currentTable.quotaUsed);

  const origin = window.location.origin + window.location.pathname;
  const inviteUrl = signTableUrl(origin, currentTable.id, currentTable.sessionToken);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-sm">
        <LiquidGlassCard variant="elevated" className="p-5 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-pastel-lavender/20 border border-pastel-lavender/40 flex items-center justify-center text-pastel-lavender shadow-glow-lavender">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">{currentTable.name}</h3>
                {isTableAuthenticated && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Autenticada" />
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Mesa vinculada a tu dispositivo
              </p>
            </div>
          </div>

          {/* Table Metrics Summary */}
          <div className="space-y-2.5 my-4">
            {/* Tier & Priority */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-300">Categoría de Mesa:</span>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${config.badgeBg}`}>
                {config.shortLabel}
              </span>
            </div>

            {/* Consumption Spend */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Consumo Registrado:
              </span>
              <strong className="text-sm font-black text-emerald-400 font-mono">
                ${currentTable.totalSpend}
              </strong>
            </div>

            {/* Song Quota */}
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-pastel-pink" />
                  Cupos de Canción:
                </span>
                <span className="font-bold text-white">
                  {currentTable.quotaUsed} / {totalQuota}{' '}
                  <span className="text-pastel-mint text-[11px]">({remaining} disponibles)</span>
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pastel-lavender to-pastel-pink"
                  style={{ width: `${Math.min(100, (currentTable.quotaUsed / totalQuota) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Share with Friends of this same table */}
          {isTableAuthenticated && (
            <div className="mt-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-400/25 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-pastel-lavender" />
                  Compartir con amigos de tu mesa:
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Pasa este enlace a tus acompañantes para que pidan canciones desde sus celulares:
              </p>
              <button
                onClick={handleCopyLink}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all tap-squish"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-pastel-mint" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Enlace de tu mesa copiado!' : 'Copiar enlace para tu mesa'}</span>
              </button>
            </div>
          )}

          {/* Close */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <LiquidButton variant="secondary" size="md" fullWidth onClick={onClose}>
              Entendido
            </LiquidButton>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
};
