import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Mic2,
  Volume2,
  Sparkles,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ListOrdered,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

export const StageDisplay: React.FC = () => {
  const { state, setActiveView } = useKaraoke();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeString, setTimeString] = useState('');

  // Digital clock for the venue
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const origin = window.location.origin + window.location.pathname;

  return (
    <div className="min-h-screen bg-night-base text-white p-6 md:p-10 flex flex-col justify-between relative overflow-hidden">
      {/* Top Bar with Venue Header & Controls */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('admin')}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Volver al panel admin"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pastel-lavender/30 via-pastel-pink/30 to-pastel-sky/30 border border-white/30 flex items-center justify-center shadow-glow-lavender">
              <Mic2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-pastel-lavender to-pastel-pink bg-clip-text text-transparent">
                  KARAOKE NIGHT CLUB
                </h1>
                <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  EN VIVO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Pide tu canción escaneando el código QR de tu mesa
              </p>
            </div>
          </div>
        </div>

        {/* Digital Time & Fullscreen */}
        <div className="flex items-center gap-4">
          <div className="text-right font-mono text-xl font-bold text-pastel-lavender hidden sm:block">
            {timeString}
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all tap-squish border border-white/10"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Center Stage */}
      <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left / Center: NOW SINGING HERO CARD */}
        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pastel-pink/20 border border-pastel-pink/40 text-pastel-pink text-sm font-extrabold shadow-glow-pink">
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>CANTANDO EN TARIMA AHORA</span>
          </div>

          {state.currentSong ? (
            <LiquidGlassCard
              variant="elevated"
              className="p-8 md:p-12 border-2 border-pastel-lavender/40 shadow-liquid-lg relative overflow-hidden"
            >
              {/* Dynamic light refraction glow */}
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-pastel-lavender/10 blur-[100px] pointer-events-none" />

              <div className="space-y-4">
                <span className="text-sm font-black text-pastel-mint uppercase tracking-widest px-3 py-1 rounded-lg bg-pastel-mint/15 border border-pastel-mint/30 inline-block">
                  {state.currentSong.tableName}
                </span>

                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                  "{state.currentSong.title}"
                </h2>

                <p className="text-2xl md:text-3xl text-pastel-lavender font-bold">
                  {state.currentSong.artist}
                </p>

                {state.currentSong.notes && (
                  <div className="pt-2">
                    <p className="text-base text-slate-300 italic bg-white/5 p-3 rounded-2xl border border-white/10 inline-block">
                      💬 "{state.currentSong.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Animated Giant Equalizer Bars */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-end gap-2.5 h-16">
                <div className="w-3 bg-gradient-to-t from-purple-500 to-pastel-lavender rounded-full eq-bar-1" />
                <div className="w-3 bg-gradient-to-t from-pink-500 to-pastel-pink rounded-full eq-bar-2" />
                <div className="w-3 bg-gradient-to-t from-emerald-500 to-pastel-mint rounded-full eq-bar-3" />
                <div className="w-3 bg-gradient-to-t from-sky-500 to-pastel-sky rounded-full eq-bar-4" />
                <div className="w-3 bg-gradient-to-t from-yellow-500 to-pastel-yellow rounded-full eq-bar-1" />
                <div className="w-3 bg-gradient-to-t from-purple-500 to-pastel-lavender rounded-full eq-bar-3" />
                <div className="w-3 bg-gradient-to-t from-pink-500 to-pastel-pink rounded-full eq-bar-2" />
              </div>
            </LiquidGlassCard>
          ) : (
            <LiquidGlassCard variant="subtle" className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-spin" style={{ animationDuration: '8s' }} />
              <h3 className="text-2xl font-bold text-white">Preparando el escenario...</h3>
              <p className="text-sm text-slate-400 mt-1">
                Escanea el código QR de tu mesa para pedir la siguiente canción
              </p>
            </LiquidGlassCard>
          )}
        </div>

        {/* Right Side: Upcoming Songs & Club QR Code */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Songs */}
          <LiquidGlassCard variant="subtle" className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ListOrdered className="w-5 h-5 text-pastel-sky" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                A Continuación ({state.queue.length})
              </h3>
            </div>

            {state.queue.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                La cola está libre. ¡Sé el primero en pedir!
              </div>
            ) : (
              <div className="space-y-3">
                {state.queue.slice(0, 4).map((song, idx) => (
                  <div
                    key={song.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-white/10 text-white font-black text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate max-w-[150px]">
                          {song.title}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {song.artist} • <strong className="text-slate-300">{song.tableName}</strong>
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-pastel-sky font-semibold">
                      ~{song.estimatedWaitMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </LiquidGlassCard>

          {/* Floating QR Code for the Whole Room to Scan */}
          <LiquidGlassCard
            variant="lavender"
            className="p-6 text-center flex flex-col items-center justify-center border border-white/20"
          >
            <div className="p-3 bg-white rounded-2xl shadow-liquid-sm mb-3">
              <QRCodeSVG
                value={origin}
                size={110}
                level="M"
                fgColor="#0a0a14"
              />
            </div>
            <h4 className="text-sm font-black text-white">¿Quieres cantar?</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Escanea el QR de tu mesa o conéctate al sistema digital
            </p>
          </LiquidGlassCard>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 relative z-10">
        <span>Sistema de Karaoke Digital Liquid Glass (Apple 2025)</span>
        <span>Prioridad inteligente por consumo de mesa</span>
      </div>
    </div>
  );
};
