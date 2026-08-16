import React from 'react';
import { History, Music, CheckCircle2, Calendar } from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

export const SongHistoryModal: React.FC = () => {
  const { state } = useKaraoke();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-pastel-sky" />
          Historial de Canciones Cantadas
        </h3>
        <p className="text-xs text-slate-400">
          Registro completo de las presentaciones realizadas durante la noche para control de cupos.
        </p>
      </div>

      {state.history.length === 0 ? (
        <LiquidGlassCard variant="subtle" className="p-8 text-center">
          <Music className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">
            Aún no se han completado canciones esta noche.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            A medida que el DJ marque canciones como finalizadas, aparecerán en este historial.
          </p>
        </LiquidGlassCard>
      ) : (
        <div className="space-y-2.5">
          {state.history.map((song, idx) => (
            <LiquidGlassCard
              key={song.id || idx}
              variant="subtle"
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{song.title}</h4>
                  <p className="text-xs text-slate-400">
                    {song.artist} • <strong className="text-slate-200">{song.tableName}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {song.completedAt
                    ? new Date(song.completedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Cantada'}
                </span>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
