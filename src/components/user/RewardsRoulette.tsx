import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, X, Zap, Gift, GlassWater, Smile } from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { RoulettePrize } from '../../types';
import { soundManager } from '../../utils/audio';

interface RewardsRouletteProps {
  isOpen?: boolean;
  onClose?: () => void;
  onPrizeWon?: (prize: RoulettePrize) => void;
  isModal?: boolean;
}

export const RewardsRoulette: React.FC<RewardsRouletteProps> = ({
  isOpen = true,
  onClose,
  onPrizeWon,
  isModal = false,
}) => {
  const { state, activeTableId, spinRoulette } = useKaraoke();
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<RoulettePrize | null>(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activePrizes = state.prizes.filter((p) => p.active);
  const numSegments = activePrizes.length;
  const segmentAngle = 360 / (numSegments || 1);

  // Draw Roulette on Canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current || numSegments === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 10;

    ctx.clearRect(0, 0, width, height);

    // Draw Wheel Segments
    activePrizes.forEach((prize, i) => {
      const startAngle = (i * segmentAngle * Math.PI) / 180;
      const endAngle = ((i + 1) * segmentAngle * Math.PI) / 180;

      // Slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      // Subtle gradient for liquid glass effect
      const grad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, radius);
      grad.addColorStop(0, prize.color + 'DD');
      grad.addColorStop(1, prize.color + '99');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();

      // Text label inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + (segmentAngle * Math.PI) / 360);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#080811';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(prize.title.length > 15 ? prize.title.substring(0, 14) + '...' : prize.title, radius - 20, 4);
      ctx.restore();
    });

    // Center Hub Pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 26, 0, 2 * Math.PI);
    ctx.fillStyle = '#080811';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();

    // Center icon/dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#E4D9FF';
    ctx.fill();
  }, [isOpen, numSegments, segmentAngle, activePrizes]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning || numSegments === 0) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Call state to randomly pick prize according to weights
    const prize = spinRoulette(activeTableId);

    // Find index of won prize
    const prizeIndex = activePrizes.findIndex((p) => p.id === prize.id);
    const targetIndex = prizeIndex >= 0 ? prizeIndex : 0;

    // Calculation to align target segment with top pointer (270 degrees)
    const prizeCenterAngle = targetIndex * segmentAngle + segmentAngle / 2;
    const targetAngle = (360 - prizeCenterAngle + 270) % 360;

    // 5 full rotations + target angle
    const extraRotations = 5 * 360;
    const totalRotation = rotation + (360 - (rotation % 360)) + extraRotations + targetAngle;

    setRotation(totalRotation);

    // Play tick sound periodically
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundManager.playTick();
      tickCount++;
      if (tickCount > 24) clearInterval(tickInterval);
    }, 150);

    // When spin finishes
    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWonPrize(prize);

      // Play victory audio
      soundManager.playVictoryFanfare();

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E4D9FF', '#FFD6E8', '#D3F8E2', '#D6EFFF', '#FFF3C4'],
      });

      if (onPrizeWon) {
        onPrizeWon(prize);
      }
    }, 4000);
  };

  const getPrizeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-6 h-6 text-emerald-400" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-purple-400" />;
      case 'GlassWater':
        return <GlassWater className="w-6 h-6 text-pink-400" />;
      case 'Gift':
        return <Gift className="w-6 h-6 text-sky-400" />;
      default:
        return <Smile className="w-6 h-6 text-yellow-400" />;
    }
  };

  const cardContent = (
    <LiquidGlassCard variant="elevated" className="p-5 sm:p-6 relative text-center">
      {/* Close button (only when modal) */}
      {isModal && onClose && !isSpinning && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="mb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-yellow/15 border border-pastel-yellow/30 text-pastel-yellow text-xs font-bold mb-2">
          <Trophy className="w-3.5 h-3.5" />
          <span>Ruleta de Recompensas</span>
        </div>
        <h3 className="text-xl font-black text-white">¡Gira y Gana Premios!</h3>
        <p className="text-xs text-slate-300 mt-0.5">
          Prueba tu suerte y gana beneficios en la barra o ventajas para cantar
        </p>
      </div>

      {/* Roulette Wheel Visual Container */}
      <div className="relative my-4 sm:my-6 flex items-center justify-center">
        {/* Top Pointer */}
        <div className="absolute -top-3.5 z-20 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-pastel-pink filter drop-shadow-[0_4px_8px_rgba(255,214,232,0.6)] animate-pulse" />
        </div>

        {/* Glowing Outer Ring */}
        <div className="p-2 rounded-full bg-gradient-to-tr from-pastel-lavender/30 via-pastel-pink/30 to-pastel-sky/30 border-2 border-white/30 shadow-glow-lavender">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
            }}
            className="rounded-full select-none cursor-pointer"
            onClick={handleSpin}
          />
        </div>
      </div>

      {/* Won Prize Popup */}
      {wonPrize ? (
        <div className="p-4 rounded-2xl bg-white/10 border border-white/20 mb-4 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 flex-shrink-0">
              {getPrizeIcon(wonPrize.icon)}
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-pastel-pink uppercase tracking-wider">
                {wonPrize.type === 'no_prize' ? '¡Gracias por participar!' : '¡Premio Otorgado!'}
              </span>
              <h4 className="text-base font-bold text-white leading-tight">
                {wonPrize.title}
              </h4>
              <p className="text-xs text-slate-300">{wonPrize.description}</p>
            </div>
          </div>
          {onClose && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center">
              <LiquidButton variant="lavender" size="sm" onClick={onClose}>
                Aceptar y Continuar
              </LiquidButton>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <LiquidButton
            variant="lavender"
            size="lg"
            fullWidth
            loading={isSpinning}
            onClick={handleSpin}
            icon={<Sparkles className="w-5 h-5 text-pastel-pink" />}
          >
            {isSpinning ? 'Girando la Ruleta...' : '¡Girar Ruleta Gratis!'}
          </LiquidButton>

          {isModal && onClose && (
            <button
              onClick={onClose}
              disabled={isSpinning}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              No gracias, ver seguimiento
            </button>
          )}
        </div>
      )}
    </LiquidGlassCard>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/85 backdrop-blur-2xl animate-in fade-in duration-300">
        <div className="w-full max-w-md">{cardContent}</div>
      </div>
    );
  }

  return cardContent;
};
