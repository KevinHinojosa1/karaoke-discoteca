import React, { useState } from 'react';
import {
  Crown,
  DollarSign,
  Plus,
  ExternalLink,
  Check,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';
import { ConsumptionTier } from '../../types';

export const TableManager: React.FC = () => {
  const {
    state,
    setTableTier,
    addTable,
    setActiveTableId,
    setActiveView,
    regenerateTableSession,
    regenerateAllSessions,
    toggleTableLock,
  } = useKaraoke();

  const [newTableId, setNewTableId] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSpendId, setEditingSpendId] = useState<string | null>(null);
  const [spendValue, setSpendValue] = useState<string>('');
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  const tablesList = Object.values(state.tables);

  const toggleRevealPin = (tableId: string) => {
    setRevealedPins((prev) => ({
      ...prev,
      [tableId]: !prev[tableId],
    }));
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableId.trim() || !newTableName.trim()) return;

    addTable(newTableId.trim().toUpperCase(), newTableName.trim());
    setNewTableId('');
    setNewTableName('');
    setShowAddForm(false);
  };

  const handleOpenAsUser = (tableId: string) => {
    setActiveTableId(tableId);
    setActiveView('user');
  };

  const handleSaveSpend = (tableId: string) => {
    const num = parseFloat(spendValue);
    if (!isNaN(num)) {
      let recommendedTier: ConsumptionTier = 'standard';
      if (num >= 100) recommendedTier = 'vip_100';
      else if (num >= 50) recommendedTier = 'medium_50';

      setTableTier(tableId, recommendedTier, num);
    }
    setEditingSpendId(null);
  };

  const handleRegenerateTable = (tableId: string, tableName: string) => {
    if (
      window.confirm(
        `¿Seguro que deseas regenerar el PIN y expulsar todos los dispositivos conectados a ${tableName}?`
      )
    ) {
      regenerateTableSession(tableId);
    }
  };

  const handleRotateAllNight = () => {
    if (
      window.confirm(
        '¿Iniciar nueva noche? Esto rotará todos los PINs y tokens de seguridad de todas las mesas del local.'
      )
    ) {
      regenerateAllSessions();
      alert('¡Todas las claves de mesa han sido renovadas con éxito!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-pastel-mint" />
            Gestión de Mesas, Consumo y Seguridad
          </h3>
          <p className="text-xs text-slate-400">
            Asigna consumo, gestiona los PINs de seguridad anti-suplantación y controla las sesiones activas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LiquidButton
            variant="secondary"
            size="sm"
            onClick={handleRotateAllNight}
            icon={<RefreshCw className="w-4 h-4 text-pastel-yellow" />}
          >
            Iniciar Nueva Noche (Rotar Todo)
          </LiquidButton>

          <LiquidButton
            variant="lavender"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            icon={<Plus className="w-4 h-4" />}
          >
            {showAddForm ? 'Cerrar' : 'Agregar Mesa'}
          </LiquidButton>
        </div>
      </div>

      {/* Add Table Form */}
      {showAddForm && (
        <LiquidGlassCard variant="lavender" className="p-5 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddTable} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ID de Mesa (ej. VIP-05, M-15)
              </label>
              <input
                type="text"
                required
                value={newTableId}
                onChange={(e) => setNewTableId(e.target.value)}
                placeholder="M-15"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre Descriptivo
              </label>
              <input
                type="text"
                required
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="Mesa 15 (Terraza)"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
              />
            </div>
            <div className="flex items-end">
              <LiquidButton type="submit" variant="mint" size="md" fullWidth>
                Guardar Mesa
              </LiquidButton>
            </div>
          </form>
        </LiquidGlassCard>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tablesList.map((table) => {
          const config = TIER_CONFIGS[table.tier];
          const totalQuota = config.maxSongs + table.extraQuotaBonus;
          const quotaUsed = table.quotaUsed;
          const remaining = Math.max(0, totalQuota - quotaUsed);
          const isEditingSpend = editingSpendId === table.id;
          const isPinRevealed = revealedPins[table.id];

          return (
            <LiquidGlassCard
              key={table.id}
              variant={table.tier === 'vip_100' ? 'lavender' : 'subtle'}
              className="p-5 relative group transition-all hover:border-white/25 flex flex-col justify-between"
            >
              <div>
                {/* Top info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-white">
                        {table.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {table.id}
                      </span>
                    </div>

                    {/* Spend Editor */}
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      {isEditingSpend ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            autoFocus
                            value={spendValue}
                            onChange={(e) => setSpendValue(e.target.value)}
                            className="w-20 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-xs"
                            placeholder="Monto"
                          />
                          <button
                            onClick={() => handleSaveSpend(table.id)}
                            className="p-1 rounded bg-pastel-mint text-night-base font-bold"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingSpendId(table.id);
                            setSpendValue(table.totalSpend.toString());
                          }}
                          className="cursor-pointer hover:bg-white/5 px-2 py-0.5 rounded-lg -ml-2 transition-colors flex items-center gap-1 text-slate-300"
                          title="Clic para editar consumo registrado"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Consumo:</span>
                          <strong className="text-emerald-300 font-bold">
                            ${table.totalSpend}
                          </strong>
                          <span className="text-[10px] text-slate-500 underline ml-1">
                            editar
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badge */}
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${config.badgeBg}`}
                  >
                    {config.shortLabel}
                  </span>
                </div>

                {/* Quota Progress */}
                <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Cupos utilizados:</span>
                    <span className="font-bold text-white">
                      {quotaUsed} / {totalQuota}{' '}
                      <span className="text-pastel-mint text-[11px]">
                        ({remaining} restantes)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pastel-lavender to-pastel-pink transition-all duration-300"
                      style={{ width: `${Math.min(100, (quotaUsed / totalQuota) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Security PIN & Session Control Box */}
                <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-pastel-lavender" />
                    <div>
                      <span className="text-[10px] text-slate-400 block">PIN de Mesa (4 dígitos):</span>
                      <span className="font-mono font-bold text-white tracking-widest text-sm">
                        {isPinRevealed ? table.pin : '••••'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleRevealPin(table.id)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      title={isPinRevealed ? 'Ocultar PIN' : 'Ver PIN'}
                    >
                      {isPinRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleRegenerateTable(table.id, table.name)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 tap-squish"
                      title="Regenerar PIN y expulsar celulares vinculados"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleTableLock(table.id)}
                      className={`p-1.5 rounded-xl border tap-squish ${
                        table.isLocked
                          ? 'bg-rose-500/25 text-rose-300 border-rose-500/40'
                          : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                      }`}
                      title={table.isLocked ? 'Mesa Bloqueada (Clic para desbloquear)' : 'Bloquear mesa'}
                    >
                      {table.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Fast Action Tier Switcher Buttons */}
                <div className="mt-3">
                  <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    Cambio rápido de categoría:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* VIP $100+ */}
                    <button
                      onClick={() => setTableTier(table.id, 'vip_100')}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center border ${
                        table.tier === 'vip_100'
                          ? 'bg-amber-400/30 text-amber-200 border-amber-300/50 shadow-glow-yellow'
                          : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Crown className="w-3 h-3 mb-0.5" />
                      <span>VIP $100+</span>
                    </button>

                    {/* Medium $50-$99 */}
                    <button
                      onClick={() => setTableTier(table.id, 'medium_50')}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center border ${
                        table.tier === 'medium_50'
                          ? 'bg-purple-400/30 text-purple-200 border-purple-300/50 shadow-glow-lavender'
                          : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 mb-0.5" />
                      <span>Medio $50</span>
                    </button>

                    {/* Standard */}
                    <button
                      onClick={() => setTableTier(table.id, 'standard')}
                      className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all flex flex-col items-center justify-center border ${
                        table.tier === 'standard'
                          ? 'bg-slate-600/40 text-slate-200 border-slate-400/40'
                          : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span>🎵 Estándar</span>
                      <span className="text-[8px] opacity-75">&lt; $100</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Test / Simulation Link */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => handleOpenAsUser(table.id)}
                  className="text-xs text-pastel-lavender hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir vista de esta mesa
                </button>

                {table.isLocked ? (
                  <span className="text-[10px] text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold">
                    Bloqueada
                  </span>
                ) : table.cooldownUntil && table.cooldownUntil > Date.now() ? (
                  <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Timer activo
                  </span>
                ) : null}
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>
    </div>
  );
};
