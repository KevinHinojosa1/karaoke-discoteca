import React, { useState, useEffect } from 'react';
import {
  Mic2,
  Music,
  User,
  Sparkles,
  Search,
  Clock,
  Crown,
  AlertCircle,
  CheckCircle2,
  Lock,
  Flame,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { PopularSongPicker } from './PopularSongPicker';
import { RewardsRoulette } from './RewardsRoulette';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';
import { requestPushPermission } from '../../utils/pushNotifications';

import { HostInvitationBadge } from './HostInvitationBadge';
import { OrderTrackingBanner } from '../portal/OrderTrackingBanner';

interface SongRequestFormProps {
  onSuccessSubmitted?: () => void;
}

export const SongRequestForm: React.FC<SongRequestFormProps> = ({
  onSuccessSubmitted,
}) => {
  const { currentTable, activeTableId, requestSong, isTableAuthenticated } = useKaraoke();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showCatalog, setShowCatalog] = useState(false);
  const [showRoulette, setShowRoulette] = useState(false);

  // Cooldown countdown timer for standard tables
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState<number>(0);

  useEffect(() => {
    if (!currentTable?.cooldownUntil) {
      setCooldownRemainingSec(0);
      return;
    }

    const interval = setInterval(() => {
      const remainingMs = (currentTable.cooldownUntil || 0) - Date.now();
      if (remainingMs > 0) {
        setCooldownRemainingSec(Math.ceil(remainingMs / 1000));
      } else {
        setCooldownRemainingSec(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTable?.cooldownUntil]);

  const tierConfig = currentTable
    ? TIER_CONFIGS[currentTable.tier]
    : TIER_CONFIGS.standard;
  const totalAllowed = currentTable
    ? tierConfig.maxSongs + currentTable.extraQuotaBonus
    : 2;
  const quotaUsed = currentTable ? currentTable.quotaUsed : 0;
  const quotasRemaining = Math.max(0, totalAllowed - quotaUsed);
  const isCooldownActive = cooldownRemainingSec > 0;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectFromCatalog = (songTitle: string, songArtist: string) => {
    setTitle(songTitle);
    setArtist(songArtist);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!isTableAuthenticated) {
      setError('Debes verificar el PIN de seguridad de tu mesa para enviar pedidos.');
      return;
    }

    if (!title.trim() || !artist.trim()) {
      setError('Por favor completa el nombre de la canción y el artista.');
      return;
    }

    // Request push notification permissions on user interaction
    requestPushPermission();

    setLoading(true);

    setTimeout(() => {
      const result = requestSong(activeTableId, title, artist, notes);
      setLoading(false);

      if (!result.success) {
        setError(result.error || 'No se pudo enviar la solicitud.');
      } else {
        setSuccessMessage('¡Canción enviada con éxito a la cola del DJ!');
        setTitle('');
        setArtist('');
        setNotes('');

        // If eligible for rewards roulette (standard tier), open roulette modal
        if (result.eligibleForRoulette) {
          setShowRoulette(true);
        } else if (onSuccessSubmitted) {
          onSuccessSubmitted();
        }
      }
    }, 350);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Persistent Order Tracking Banner */}
      <OrderTrackingBanner />
      {/* Security Host Invitation Badge */}
      <HostInvitationBadge />
      {/* Table Status Card */}
      <LiquidGlassCard variant="lavender" className="p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pastel-lavender/30 to-pastel-pink/30 border border-white/20 flex items-center justify-center shadow-glow-lavender">
              {currentTable?.tier === 'vip_100' ? (
                <Crown className="w-6 h-6 text-amber-300" />
              ) : (
                <Mic2 className="w-6 h-6 text-pastel-lavender" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  {currentTable?.name || `Mesa ${activeTableId}`}
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${tierConfig.badgeBg}`}
                >
                  {tierConfig.shortLabel}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Consumo: <strong className="text-pastel-mint">${currentTable?.totalSpend || 0}</strong> • Prioridad{' '}
                <span className="capitalize font-semibold text-pastel-lavender">
                  {tierConfig.priority === 'high' ? 'Alta' : tierConfig.priority === 'medium' ? 'Media-Alta' : 'Estándar'}
                </span>
              </p>
            </div>
          </div>

          {/* Quota Badge */}
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-400">Cupos restantes</div>
            <div className="text-lg font-black text-white flex items-center justify-end gap-1">
              <span className={quotasRemaining > 0 ? 'text-pastel-mint' : 'text-rose-400'}>
                {quotasRemaining}
              </span>
              <span className="text-xs text-slate-500 font-normal">/ {totalAllowed}</span>
            </div>
          </div>
        </div>

        {/* Progress bar of quota */}
        <div className="mt-3 w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pastel-lavender to-pastel-pink transition-all duration-500"
            style={{ width: `${Math.min(100, (quotaUsed / totalAllowed) * 100)}%` }}
          />
        </div>

        {/* Cooldown notice if active */}
        {isCooldownActive && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-amber-200 text-xs font-medium">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Intervalo de espera entre canciones:</span>
            </div>
            <span className="font-mono font-bold text-amber-300 text-sm">
              {formatTimer(cooldownRemainingSec)}
            </span>
          </div>
        )}
      </LiquidGlassCard>

      {/* Main Request Form */}
      <LiquidGlassCard variant="elevated" className="p-5 md:p-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pastel-pink" />
              Pedir Canción de Karaoke
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Envía tu pedido directo a la pantalla del DJ
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCatalog(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-pastel-pink text-xs font-semibold flex items-center gap-1.5 transition-all tap-squish"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Ver Catálogo</span>
          </button>
        </div>

        {/* Error / Success feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-pastel-mint/15 border border-pastel-mint/30 text-pastel-mint text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Locked Table Code Field (Autofilled from QR) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1 flex items-center justify-between">
              <span>Código de Mesa (Autocompletado QR)</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> No editable
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                value={`${currentTable?.name || activeTableId} (${activeTableId})`}
                className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-semibold cursor-not-allowed text-sm opacity-90"
              />
            </div>
          </div>

          {/* Song Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 ml-1">
              Nombre de la Canción <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Music className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: De Música Ligera / Provenza / Despacito"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-lavender focus:bg-white/10 text-sm transition-all"
              />
            </div>
          </div>

          {/* Artist Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5 ml-1">
              Artista o Banda <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Ej: Soda Stereo / Karol G / Luis Miguel"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-pink focus:bg-white/10 text-sm transition-all"
              />
            </div>
          </div>

          {/* Notes / Dedication Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 ml-1">
              Dedicatoria o Notas (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Dedicada para Laura / Cantamos 3 personas"
              className="w-full px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-mint focus:bg-white/10 text-xs transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <LiquidButton
              type="submit"
              variant="lavender"
              fullWidth
              size="lg"
              loading={loading}
              disabled={quotasRemaining <= 0 || isCooldownActive}
              icon={<Flame className="w-5 h-5 text-pastel-pink" />}
            >
              {quotasRemaining <= 0
                ? 'Límite de Cupos Alcanzado'
                : isCooldownActive
                ? `Espera ${formatTimer(cooldownRemainingSec)} para pedir`
                : '🚀 Enviar a la Cola del DJ'}
            </LiquidButton>
          </div>
        </form>

        {/* VIP Upsell Hint */}
        {currentTable?.tier === 'standard' && (
          <div className="mt-4 p-3 rounded-2xl bg-pastel-lavender/10 border border-pastel-lavender/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Crown className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>¿Quieres prioridad alta y sin esperas?</span>
            </div>
            <span className="font-semibold text-pastel-lavender">Consumo $100+</span>
          </div>
        )}
      </LiquidGlassCard>

      {/* Modals */}
      <PopularSongPicker
        isOpen={showCatalog}
        onClose={() => setShowCatalog(false)}
        onSelectSong={handleSelectFromCatalog}
      />

      <RewardsRoulette
        isOpen={showRoulette}
        onClose={() => {
          setShowRoulette(false);
          if (onSuccessSubmitted) onSuccessSubmitted();
        }}
      />
    </div>
  );
};
