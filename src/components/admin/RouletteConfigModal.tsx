import React, { useState } from 'react';
import {
  Trophy,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { RoulettePrize } from '../../types';

export const RouletteConfigModal: React.FC = () => {
  const { state, updatePrizes } = useKaraoke();
  const [prizes, setPrizes] = useState<RoulettePrize[]>(state.prizes);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const totalWeight = prizes.reduce(
    (sum, p) => sum + (p.active ? Number(p.weight) || 0 : 0),
    0
  );

  const handleUpdateField = (
    index: number,
    field: keyof RoulettePrize,
    value: string | number | boolean
  ) => {
    const updated = [...prizes];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setPrizes(updated);
  };

  const handleToggleActive = (index: number) => {
    const updated = [...prizes];
    updated[index] = {
      ...updated[index],
      active: !updated[index].active,
    };
    setPrizes(updated);
  };

  const handleDeletePrize = (index: number) => {
    if (prizes.length <= 2) {
      alert('Debe haber al menos 2 premios en la ruleta.');
      return;
    }
    const updated = prizes.filter((_, i) => i !== index);
    setPrizes(updated);
  };

  const handleAddPrize = () => {
    const newPrize: RoulettePrize = {
      id: `prize-custom-${Date.now()}`,
      title: 'Nuevo Premio',
      description: 'Descripción del premio para la barra o karaoke',
      type: 'drink_discount',
      value: 10,
      weight: 20,
      color: '#FFD6E8',
      icon: 'Gift',
      active: true,
    };
    setPrizes([...prizes, newPrize]);
  };

  const handleSave = () => {
    updatePrizes(prizes);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-pastel-yellow" />
            Configuración de la Ruleta de Recompensas
          </h3>
          <p className="text-xs text-slate-400">
            Ajusta los premios, probabilidades y colores que verán las mesas estándar al enviar su canción.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LiquidButton
            variant="secondary"
            size="sm"
            onClick={handleAddPrize}
            icon={<Plus className="w-4 h-4" />}
          >
            Agregar Premio
          </LiquidButton>

          <LiquidButton
            variant="lavender"
            size="sm"
            onClick={handleSave}
            icon={<Save className="w-4 h-4" />}
          >
            Guardar Cambios
          </LiquidButton>
        </div>
      </div>

      {saveFeedback && (
        <div className="p-3 rounded-2xl bg-pastel-mint/15 border border-pastel-mint/30 text-pastel-mint text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>¡Configuración de la ruleta guardada y sincronizada en tiempo real!</span>
        </div>
      )}

      {/* Prizes Editor List */}
      <div className="space-y-3">
        {prizes.map((prize, idx) => {
          const probPercent =
            totalWeight > 0 && prize.active
              ? Math.round(((prize.weight || 0) / totalWeight) * 100)
              : 0;

          return (
            <LiquidGlassCard
              key={prize.id}
              variant="subtle"
              className={`p-4 transition-all ${
                prize.active ? 'border-white/15' : 'opacity-50 border-white/5'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Active Checkbox + Color sample */}
                <div className="md:col-span-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={prize.active}
                    onChange={() => handleToggleActive(idx)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-white/10"
                    title="Activar o desactivar premio"
                  />
                  <div
                    className="w-5 h-5 rounded-full border border-white/40 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: prize.color }}
                  />
                </div>

                {/* Title & Description */}
                <div className="md:col-span-4 space-y-1">
                  <input
                    type="text"
                    value={prize.title}
                    onChange={(e) => handleUpdateField(idx, 'title', e.target.value)}
                    placeholder="Título del premio"
                    className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-pastel-lavender"
                  />
                  <input
                    type="text"
                    value={prize.description}
                    onChange={(e) => handleUpdateField(idx, 'description', e.target.value)}
                    placeholder="Descripción"
                    className="w-full px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[11px] focus:outline-none focus:border-pastel-lavender"
                  />
                </div>

                {/* Prize Type */}
                <div className="md:col-span-3">
                  <label className="block text-[10px] text-slate-400 mb-0.5">Tipo de Recompensa</label>
                  <select
                    value={prize.type}
                    onChange={(e) => handleUpdateField(idx, 'type', e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-night-surface border border-white/15 text-white text-xs"
                  >
                    <option value="time_reduction">⚡ Reducción de tiempo (Min)</option>
                    <option value="extra_song">✨ Canción Extra</option>
                    <option value="drink_discount">🍸 Descuento en Barra (%)</option>
                    <option value="no_prize">😊 Sigue Intentando</option>
                  </select>
                </div>

                {/* Probability Weight & Calculated % */}
                <div className="md:col-span-3 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] text-slate-400 mb-0.5">Peso Probabilidad</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={prize.weight}
                        onChange={(e) => handleUpdateField(idx, 'weight', parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 rounded-xl bg-white/5 border border-white/10 text-white text-xs text-center font-bold"
                      />
                      <span className="text-xs font-bold text-pastel-mint bg-pastel-mint/15 px-2 py-0.5 rounded-lg border border-pastel-mint/30">
                        {probPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeletePrize(idx)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 mt-3"
                    title="Eliminar premio"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>
    </div>
  );
};
