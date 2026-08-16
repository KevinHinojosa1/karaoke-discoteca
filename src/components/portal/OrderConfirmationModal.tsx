import React, { useState } from 'react';
import {
  Wine,
  Crown,
  Check,
  X,
  Send,
  AlertCircle,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { MenuItem } from '../../data/liquorMenu';

interface OrderConfirmationModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced?: (orderId: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  item,
  isOpen,
  onClose,
  onOrderPlaced,
}) => {
  const { currentTable, activeTableId, isTableAuthenticated, placeOrder } = useKaraoke();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const totalAmount = item.price * quantity;
  const currentSpend = currentTable?.totalSpend || 0;
  const projectedSpend = currentSpend + totalAmount;
  const willBeVip = projectedSpend >= 100 && (currentTable?.tier !== 'vip_100');
  const willBeMedium = projectedSpend >= 50 && projectedSpend < 100 && (currentTable?.tier === 'standard');

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isTableAuthenticated) {
      setError('Por favor autentica tu mesa con el PIN antes de enviar pedidos a la barra.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = placeOrder(activeTableId, item, quantity, notes);
      setLoading(false);

      if (res.success && res.orderId) {
        if (onOrderPlaced) onOrderPlaced(res.orderId);
        onClose();
      } else {
        setError(res.error || 'Error al enviar pedido a la barra');
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-md">
        <LiquidGlassCard variant="elevated" className="p-5 sm:p-6 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-glow-yellow flex-shrink-0">
              <Wine className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                ORDEN PARA LA BARRA
              </span>
              <h3 className="text-lg font-black text-white leading-tight">
                {item.name}
              </h3>
              <p className="text-xs text-slate-400">
                {currentTable?.name || `Mesa ${activeTableId}`}
              </p>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Inclusions summary */}
          {item.includes && item.includes.length > 0 && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1 mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tu pedido incluye:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {item.includes.map((inc, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-pastel-mint" />
                    {inc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* VIP Benefit Preview */}
          {(willBeVip || willBeMedium || item.isVipEligible) && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-400/20 via-purple-500/15 to-pastel-pink/15 border border-amber-300/40 text-xs space-y-1 mb-4 shadow-glow-yellow">
              <div className="flex items-center gap-1.5 text-amber-200 font-bold">
                <Crown className="w-4 h-4 text-amber-300" />
                <span>¡Beneficio de Karaoke al confirmar!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Al despacharse este pedido, tu consumo sumará <strong>${totalAmount}</strong> (Total: ${projectedSpend}), desbloqueando{' '}
                <strong className="text-white">5 canciones con Prioridad {willBeVip || item.isVipEligible ? 'Alta ⭐' : 'Media 💎'}</strong>.
              </p>
            </div>
          )}

          {/* Quantity & Notes Form */}
          <form onSubmit={handleConfirmOrder} className="space-y-3">
            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-slate-300 font-medium">Cantidad:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center tap-squish"
                >
                  -
                </button>
                <span className="font-mono font-black text-white text-base w-4 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center tap-squish"
                >
                  +
                </button>
              </div>
            </div>

            {/* Notes / Special Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Instrucciones para el bartender o mesero (opcional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Mucho hielo, limón verde, vasos altos..."
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-lavender text-xs"
              />
            </div>

            {/* Total Price & Action Button */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block">Total a Pagar:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ${totalAmount}
                </span>
              </div>

              <div className="flex-1 max-w-[210px]">
                <LiquidButton
                  type="submit"
                  variant="lavender"
                  size="md"
                  fullWidth
                  loading={loading}
                  icon={<Send className="w-4 h-4 text-pastel-pink" />}
                >
                  Enviar a la Barra
                </LiquidButton>
              </div>
            </div>
          </form>
        </LiquidGlassCard>
      </div>
    </div>
  );
};
