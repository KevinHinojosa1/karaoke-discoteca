import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, X } from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';

export const OrderTrackingBanner: React.FC = () => {
  const { state, activeTableId } = useKaraoke();
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const tableOrders = (state.orders || [])
    .filter((o) => o.tableId === activeTableId && !dismissedIds.includes(o.id))
    .slice(0, 3); // show up to 3 most recent

  if (tableOrders.length === 0) return null;

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-2.5 w-full animate-in fade-in duration-300">
      {tableOrders.map((order) => {
        const isCancelled = order.status === 'cancelled';
        const isPending = order.status === 'pending';
        const isDelivered = order.status === 'delivered';

        if (isCancelled) {
          return (
            <LiquidGlassCard
              key={order.id}
              variant="elevated"
              className="p-3.5 sm:p-4 border-2 border-rose-500/50 bg-rose-500/10 shadow-glow-pink relative"
            >
              <button
                onClick={() => handleDismiss(order.id)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-rose-300 hover:text-white transition-colors"
                title="Descartar aviso"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-start gap-3 pr-6">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-rose-200 text-sm">
                      Pedido Cancelado en Barra
                    </span>
                    <span className="text-[10px] font-mono text-rose-300/80 bg-rose-500/20 px-1.5 py-0.5 rounded">
                      ${order.totalAmount}
                    </span>
                  </div>

                  <p className="text-slate-300">
                    Producto:{' '}
                    <strong>{order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}</strong>
                  </p>

                  <div className="p-2 rounded-lg bg-black/30 border border-rose-500/30 text-rose-200 text-[11px] mt-1">
                    ⚠️ <strong>Motivo de la barra:</strong>{' '}
                    <span>{order.cancellationReason || 'Producto temporalmente agotado'}</span>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          );
        }

        if (isPending) {
          return (
            <LiquidGlassCard
              key={order.id}
              variant="lavender"
              className="p-3.5 sm:p-4 border-amber-400/50 bg-amber-400/10 shadow-glow-yellow relative animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-0.5 text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-200 text-sm">
                      Comanda en Preparación
                    </span>
                    <span className="font-mono text-amber-300 font-bold">
                      ${order.totalAmount}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                  <p className="text-[10px] text-amber-300/80 mt-0.5">
                    El personal del bar está preparando tu comanda para llevarla a tu mesa.
                  </p>
                </div>
              </div>
            </LiquidGlassCard>
          );
        }

        if (isDelivered) {
          return (
            <LiquidGlassCard
              key={order.id}
              variant="subtle"
              className="p-3 sm:p-3.5 border-emerald-400/30 bg-emerald-500/10 relative"
            >
              <button
                onClick={() => handleDismiss(order.id)}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                title="Cerrar"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="flex items-center gap-2.5 pr-6 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white block">
                    Comanda Entregada (${order.totalAmount})
                  </span>
                  <span className="text-[11px] text-emerald-300">
                    {order.items.map((i) => i.name).join(', ')} • ¡Consumo sumado a tu mesa!
                  </span>
                </div>
              </div>
            </LiquidGlassCard>
          );
        }

        return null;
      })}
    </div>
  );
};
