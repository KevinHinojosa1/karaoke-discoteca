import React, { useState } from 'react';
import {
  Crown,
  DollarSign,
  Plus,
  ExternalLink,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  RotateCcw,
  X,
  Save,
  Receipt,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';
import { ConsumptionTier, Table } from '../../types';
import { InvoiceModal } from './InvoiceModal';

export const TableManager: React.FC = () => {
  const {
    state,
    setTableTier,
    addTable,
    editTable,
    deleteTable,
    resetTableSpend,
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

  // Full Table Edit Modal State
  const [selectedTableForEdit, setSelectedTableForEdit] = useState<Table | null>(null);
  const [selectedTableForInvoice, setSelectedTableForInvoice] = useState<Table | null>(null);
  const [editName, setEditName] = useState('');
  const [editSpend, setEditSpend] = useState('');
  const [editTier, setEditTier] = useState<ConsumptionTier>('standard');
  const [editExtraSongs, setEditExtraSongs] = useState('0');
  const [editPin, setEditPin] = useState('');

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
      if (num >= 101) recommendedTier = 'vip_100';
      else if (num >= 51) recommendedTier = 'medium_50';

      setTableTier(tableId, recommendedTier, num);
    }
    setEditingSpendId(null);
  };

  const handleRegenerateTable = (tableId: string, name: string) => {
    if (window.confirm(`¿Regenerar PIN y expulsar celulares vinculados de ${name}? Todos los usuarios de esta mesa deberán ingresar el nuevo PIN.`)) {
      const res = regenerateTableSession(tableId);
      alert(`Nuevo PIN para ${name}: ${res.newPin}`);
    }
  };

  const handleResetSpend = (table: Table) => {
    if (window.confirm(`¿Reiniciar consumo a $0 y crear NUEVA cuenta para ${table.name}? Se borrarán los dispositivos vinculados y se generará un nuevo PIN para los nuevos clientes.`)) {
      resetTableSpend(table.id);
    }
  };

  const handleDeleteTable = (table: Table) => {
    if (window.confirm(`¿ELIMINAR permanentemente la ${table.name} (${table.id}) del sistema? Esta acción no se puede deshacer.`)) {
      deleteTable(table.id);
    }
  };

  const handleOpenEditModal = (table: Table) => {
    setSelectedTableForEdit(table);
    setEditName(table.name);
    setEditSpend(table.totalSpend.toString());
    setEditTier(table.tier);
    setEditExtraSongs(table.extraQuotaBonus.toString());
    setEditPin(table.pin);
  };

  const handleSaveTableModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableForEdit) return;

    const numSpend = parseFloat(editSpend) || 0;
    const numExtra = parseInt(editExtraSongs, 10) || 0;

    editTable(selectedTableForEdit.id, {
      name: editName.trim() || selectedTableForEdit.name,
      totalSpend: numSpend,
      tier: editTier,
      extraQuotaBonus: numExtra,
      pin: editPin.trim() || selectedTableForEdit.pin,
    });

    setSelectedTableForEdit(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Crown className="w-5 h-5 text-pastel-lavender" />
            Gestión de Mesas, Consumo y Seguridad
          </h2>
          <p className="text-xs text-slate-400">
            Control de cuentas, categorías, cupos de karaoke y celulares vinculados por mesa.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (window.confirm('¿Reiniciar sesiones de TODAS las mesas para una nueva noche de fiesta?')) {
                regenerateAllSessions();
                alert('¡Todas las mesas tienen nuevos PINs y sesiones limpias!');
              }
            }}
            className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-bold flex items-center gap-1.5 transition-all tap-squish"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rotar Todas (Nueva Noche)</span>
          </button>

          <LiquidButton
            variant="lavender"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            icon={<Plus className="w-4 h-4" />}
          >
            Agregar Mesa
          </LiquidButton>
        </div>
      </div>

      {/* Add Table Form Dropdown */}
      {showAddForm && (
        <LiquidGlassCard variant="elevated" className="p-4 sm:p-5 animate-in fade-in duration-200 border-pastel-lavender/40">
          <h3 className="text-sm font-bold text-white mb-3">Registrar Nueva Mesa en la Discoteca</h3>
          <form onSubmit={handleAddTable} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ID Mesa (ej: M-09, VIP-04)</label>
              <input
                type="text"
                required
                value={newTableId}
                onChange={(e) => setNewTableId(e.target.value)}
                placeholder="M-09"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs uppercase focus:outline-none focus:border-pastel-lavender"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Descriptivo</label>
              <input
                type="text"
                required
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="Mesa 09 (Terraza)"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
              />
            </div>
            <div className="flex items-end gap-2">
              <LiquidButton type="submit" variant="lavender" size="md" fullWidth>
                Crear Mesa
              </LiquidButton>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs"
              >
                Cancelar
              </button>
            </div>
          </form>
        </LiquidGlassCard>
      )}

      {/* Rules Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 text-xs">
        {/* Tier Standard */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <div>
              <strong className="text-white block">Estándar (≤ $50)</strong>
              <span className="text-[10px] text-slate-400">2 canciones • Cooldown 15m</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-slate-300 font-bold">Baja</span>
        </div>

        {/* Tier Medium */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pastel-lavender" />
            <div>
              <strong className="text-purple-200 block">Medio ($51 - $100)</strong>
              <span className="text-[10px] text-slate-300">3 canciones • Sin espera</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-200 font-bold">Media 💎</span>
        </div>

        {/* Tier VIP Gold */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between shadow-glow-yellow">
          <div className="flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <div>
              <strong className="text-amber-200 block">VIP Gold (&gt; $100)</strong>
              <span className="text-[10px] text-slate-300">5 canciones • Prioridad Alta</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-200 font-bold">VIP ⭐</span>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
              className="p-4 sm:p-5 relative group transition-all hover:border-white/25 flex flex-col justify-between"
            >
              <div>
                {/* Top info */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-base font-extrabold text-white truncate">
                        {table.name}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {table.id}
                      </span>
                    </div>

                    {/* Spend Editor */}
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      {isEditingSpend ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-slate-400 font-bold">$</span>
                          <input
                            type="number"
                            autoFocus
                            value={spendValue}
                            onChange={(e) => setSpendValue(e.target.value)}
                            className="w-16 sm:w-20 px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-white text-xs"
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
                          title="Clic para editar consumo rápido"
                        >
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Consumo:</span>
                          <strong className="text-emerald-300 font-bold">
                            ${table.totalSpend}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badge & Quick Action Icons */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold border flex-shrink-0 ${config.badgeBg}`}
                    >
                      {config.shortLabel}
                    </span>

                    {/* Edit & Delete Icons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditModal(table)}
                        className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                        title="Editar mesa / cuenta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleResetSpend(table)}
                        className="p-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                        title="Reiniciar consumo a $0 (Nueva Cuenta)"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table)}
                        className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                        title="Eliminar mesa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="mt-3.5 p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Cupos:</span>
                    <span className="font-bold text-white">
                      {quotaUsed} / {totalQuota}{' '}
                      <span className="text-pastel-mint text-[10px] sm:text-[11px]">
                        ({remaining} libres)
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
                <div className="mt-3 p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-pastel-lavender flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">PIN:</span>
                        <span className="font-mono font-bold text-white tracking-wider text-xs">
                          {isPinRevealed ? table.pin : '••••'}
                        </span>
                      </div>
                      <span className="text-[10px] text-pastel-sky block mt-0.5">
                        📱 {(table.authorizedDevices || []).length} / 3 celulares activos
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleRevealPin(table.id)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white tap-squish"
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
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
                      }`}
                      title={table.isLocked ? 'Mesa Bloqueada (Clic para desbloquear)' : 'Bloquear mesa'}
                    >
                      {table.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Cooldown Status */}
                {table.cooldownUntil && table.cooldownUntil > Date.now() && (
                  <div className="mt-2 text-[10px] text-amber-300 bg-amber-400/10 border border-amber-400/20 p-2 rounded-xl flex items-center justify-between">
                    <span>En tiempo de espera</span>
                    <strong className="font-mono">
                      {Math.ceil((table.cooldownUntil - Date.now()) / (1000 * 60))} min
                    </strong>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-1 sm:gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTableTier(table.id, 'standard', 0)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all tap-squish ${
                      table.tier === 'standard'
                        ? 'bg-slate-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    Estándar
                  </button>
                  <button
                    onClick={() => setTableTier(table.id, 'medium_50', 51)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all tap-squish ${
                      table.tier === 'medium_50'
                        ? 'bg-pastel-lavender/30 text-pastel-lavender border border-pastel-lavender/50'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    $51+
                  </button>
                  <button
                    onClick={() => setTableTier(table.id, 'vip_100', 101)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all tap-squish ${
                      table.tier === 'vip_100'
                        ? 'bg-amber-400/30 text-amber-200 border border-amber-400/50'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    VIP $101+
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedTableForInvoice(table)}
                    className="px-2 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold flex items-center gap-1 transition-all tap-squish"
                    title="Facturar consumo total de esta mesa"
                  >
                    <Receipt className="w-3 h-3" />
                    <span>Facturar</span>
                  </button>

                  <button
                    onClick={() => handleOpenAsUser(table.id)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                    title="Abrir como cliente de esta mesa"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>

      {/* Edit Table Modal */}
      {selectedTableForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-sm">
            <LiquidGlassCard variant="elevated" className="p-5 sm:p-6 relative">
              <button
                onClick={() => setSelectedTableForEdit(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-black text-white mb-1 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-pastel-lavender" />
                Editar Mesa ({selectedTableForEdit.id})
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Configura el nombre, consumo, categoría y PIN de la mesa.
              </p>

              <form onSubmit={handleSaveTableModal} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre de la Mesa:
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Consumo ($):
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={editSpend}
                      onChange={(e) => setEditSpend(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono font-bold text-xs focus:outline-none focus:border-pastel-lavender"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      PIN (4 dígitos):
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={editPin}
                      onChange={(e) => setEditPin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono font-bold text-xs focus:outline-none focus:border-pastel-lavender"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Categoría / Tier:
                    </label>
                    <select
                      value={editTier}
                      onChange={(e) => setEditTier(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
                    >
                      <option value="standard">Estándar (≤ $50)</option>
                      <option value="medium_50">Medio ($51 - $100)</option>
                      <option value="vip_100">VIP Gold (&gt; $100)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Cupos Extra:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={editExtraSongs}
                      onChange={(e) => setEditExtraSongs(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <LiquidButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTableForEdit(null)}
                  >
                    Cancelar
                  </LiquidButton>
                  <LiquidButton
                    type="submit"
                    variant="lavender"
                    size="sm"
                    icon={<Save className="w-3.5 h-3.5" />}
                  >
                    Guardar Cambios
                  </LiquidButton>
                </div>
              </form>
            </LiquidGlassCard>
          </div>
        </div>
      )}

      {/* Invoice Modal for Tables */}
      <InvoiceModal
        isOpen={Boolean(selectedTableForInvoice)}
        onClose={() => setSelectedTableForInvoice(null)}
        table={selectedTableForInvoice}
      />
    </div>
  );
};
