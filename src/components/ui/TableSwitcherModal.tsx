import React from 'react';
import { X, QrCode, CheckCircle, Sparkles, Crown, DollarSign } from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from './LiquidGlassCard';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';

interface TableSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TableSwitcherModal: React.FC<TableSwitcherModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, activeTableId, setActiveTableId } = useKaraoke();

  if (!isOpen) return null;

  const tablesList = Object.values(state.tables);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col">
        <LiquidGlassCard variant="elevated" className="p-6 flex flex-col max-h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pastel-lavender/20 border border-pastel-lavender/30 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-pastel-lavender" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Simular Mesa (Escaneo QR)</h3>
                <p className="text-xs text-slate-400">Selecciona con qué mesa deseas interactuar en la discoteca</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tables Grid */}
          <div className="overflow-y-auto py-4 space-y-2.5 pr-1">
            {tablesList.map((table) => {
              const isSelected = table.id === activeTableId;
              const config = TIER_CONFIGS[table.tier];
              const totalQuota = config.maxSongs + table.extraQuotaBonus;
              const isCooldown = table.tier === 'standard' && table.cooldownUntil && table.cooldownUntil > Date.now();

              return (
                <div
                  key={table.id}
                  onClick={() => {
                    setActiveTableId(table.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between border ${
                    isSelected
                      ? 'bg-pastel-lavender/20 border-pastel-lavender/60 shadow-glow-lavender'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                        table.tier === 'vip_100'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : table.tier === 'medium_50'
                          ? 'bg-purple-400/20 text-purple-300 border border-purple-400/40'
                          : 'bg-slate-700/40 text-slate-300 border border-slate-600/40'
                      }`}
                    >
                      {table.tier === 'vip_100' ? <Crown className="w-4 h-4" /> : table.id}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{table.name}</span>
                        {isSelected && (
                          <span className="text-[10px] bg-pastel-lavender/30 text-pastel-lavender px-2 py-0.5 rounded-full font-bold">
                            Activa
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${config.badgeBg}`}>
                          {config.shortLabel}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-slate-300">
                          <DollarSign className="w-3 h-3 text-emerald-400" /> ${table.totalSpend}
                        </span>
                        <span>•</span>
                        <span>Cupos: {table.quotaUsed}/{totalQuota}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCooldown && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        En espera
                      </span>
                    )}
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-pastel-lavender" />
                    ) : (
                      <span className="text-xs text-slate-400 group-hover:text-white">Cambiar</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-white/10 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5 flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-pastel-pink" />
            <span>En producción, cada mesa accede escaneando su propio sticker QR</span>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
};
