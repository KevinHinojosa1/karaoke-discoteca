import React, { useState } from 'react';
import {
  DollarSign,
  Wine,
  TrendingUp,
  CheckCircle2,
  X,
  Crown,
  ShoppingBag,
  BellRing,
  Award,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { BarOrder } from '../../types';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';

export const OrdersFinanceDashboard: React.FC = () => {
  const { state, confirmAndDeliverOrder, cancelOrder } = useKaraoke();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');

  const orders = state.orders || [];

  // Financial Metrics
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled');

  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderTicket = deliveredOrders.length > 0 ? Math.round(totalRevenue / deliveredOrders.length) : 0;

  // Tables sorted by spend
  const sortedTables = Object.values(state.tables).sort((a, b) => b.totalSpend - a.totalSpend);
  const topSpendingTable = sortedTables.length > 0 ? sortedTables[0] : null;

  // Category Breakdown
  const categoryRevenue: Record<string, number> = {
    combos_vip: 0,
    botellas: 0,
    cocteles: 0,
    shots_cervezas: 0,
    piqueos: 0,
  };

  deliveredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const cat = item.category || 'combos_vip';
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.price * item.quantity;
    });
  });

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const handleDeliver = (order: BarOrder) => {
    if (window.confirm(`¿Confirmar entrega de ${order.items.map((i) => i.name).join(', ')} para ${order.tableName} ($${order.totalAmount})? Esto sumará el valor automáticamente al consumo de la mesa.`)) {
      confirmAndDeliverOrder(order.id);
    }
  };

  const handleCancel = (order: BarOrder) => {
    const reason = window.prompt('Motivo de cancelación (ej. Producto agotado):');
    if (reason !== null) {
      cancelOrder(order.id, reason || undefined);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Financial KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Metric 1: Total Revenue Delivered */}
        <LiquidGlassCard variant="elevated" className="p-4 border-emerald-400/40 shadow-glow-mint">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Total Vendido</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono mt-1">
            ${totalRevenue}
          </div>
          <span className="text-[10px] text-emerald-400/80 block">
            {deliveredOrders.length} pedidos despachados
          </span>
        </LiquidGlassCard>

        {/* Metric 2: Pending Orders */}
        <LiquidGlassCard
          variant={pendingOrders.length > 0 ? 'lavender' : 'subtle'}
          className={`p-4 ${pendingOrders.length > 0 ? 'border-pastel-pink/50 shadow-glow-pink animate-pulse' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Por Despachar</span>
            <BellRing className="w-4 h-4 text-pastel-pink" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {pendingOrders.length}{' '}
            <span className="text-sm font-normal text-slate-400">(${pendingRevenue})</span>
          </div>
          <span className="text-[10px] text-pastel-pink block">
            {pendingOrders.length > 0 ? '¡Órdenes esperando en barra!' : 'Barra al día'}
          </span>
        </LiquidGlassCard>

        {/* Metric 3: Avg Ticket */}
        <LiquidGlassCard variant="subtle" className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Ticket Promedio</span>
            <TrendingUp className="w-4 h-4 text-pastel-sky" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            ${avgOrderTicket}
          </div>
          <span className="text-[10px] text-pastel-sky block">por comanda entregada</span>
        </LiquidGlassCard>

        {/* Metric 4: Top Spender Table */}
        <LiquidGlassCard variant="subtle" className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Mesa Líder</span>
            <Crown className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-lg sm:text-xl font-black text-white truncate mt-1">
            {topSpendingTable?.name || 'N/A'}
          </div>
          <span className="text-[10px] text-amber-300 block font-bold font-mono">
            ${topSpendingTable?.totalSpend || 0} consumidos
          </span>
        </LiquidGlassCard>
      </div>

      {/* Main Grid: Orders Queue (Left) & Sales Leaderboard / Categories (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Left Column: Live Orders Queue (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-pastel-lavender" />
              Comandas y Pedidos en Vivo
            </h3>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: `Todos (${orders.length})` },
                { id: 'pending', label: `🟡 Pendientes (${pendingOrders.length})` },
                { id: 'delivered', label: `🟢 Entregados (${deliveredOrders.length})` },
                { id: 'cancelled', label: `🔴 Cancelados (${cancelledOrders.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all tap-squish ${
                    filterStatus === tab.id
                      ? 'bg-pastel-lavender/30 text-pastel-lavender border border-pastel-lavender/50'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <LiquidGlassCard variant="subtle" className="p-8 text-center">
                <Wine className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">
                  No hay pedidos con el filtro seleccionado.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Cuando una mesa pida un combo desde la carta, la comanda aparecerá aquí con alerta sonora.
                </p>
              </LiquidGlassCard>
            ) : (
              filteredOrders.map((order) => {
                const isPending = order.status === 'pending';
                const isDelivered = order.status === 'delivered';

                return (
                  <LiquidGlassCard
                    key={order.id}
                    variant={isPending ? 'lavender' : 'subtle'}
                    className={`p-4 sm:p-5 flex flex-col justify-between transition-all ${
                      isPending ? 'border-2 border-pastel-pink/50 shadow-glow-pink' : 'border-white/10'
                    }`}
                  >
                    <div>
                      {/* Order Header */}
                      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-white/10">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-extrabold text-white">
                              {order.tableName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                              {order.tableId}
                            </span>
                            {order.isVipQualifying && (
                              <span className="text-[9px] text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30 font-bold flex items-center gap-1">
                                <Crown className="w-3 h-3" /> Combo VIP
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                            Hora: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Status Badge & Amount */}
                        <div className="text-right flex-shrink-0">
                          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono block">
                            ${order.totalAmount}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              isPending
                                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 animate-pulse'
                                : isDelivered
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {isPending ? '🟡 Pendiente' : isDelivered ? '🟢 Entregado' : '🔴 Cancelado'}
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered List */}
                      <div className="py-3 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2 text-xs">
                            <div>
                              <div className="font-bold text-white flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-white/10 text-pastel-lavender flex items-center justify-center font-mono text-[11px]">
                                  {item.quantity}x
                                </span>
                                <span>{item.name}</span>
                              </div>
                              {item.includes && item.includes.length > 0 && (
                                <p className="text-[11px] text-slate-400 ml-7 mt-0.5">
                                  Incluye: {item.includes.join(' • ')}
                                </p>
                              )}
                            </div>
                            <span className="font-mono text-slate-300 flex-shrink-0 font-bold">
                              ${item.price * item.quantity}
                            </span>
                          </div>
                        ))}

                        {/* Customer Notes */}
                        {order.notes && (
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-pastel-mint italic mt-2">
                            💬 <strong>Nota del cliente:</strong> "{order.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {isPending && (
                      <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCancel(order)}
                          className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all tap-squish"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>

                        <LiquidButton
                          variant="mint"
                          size="sm"
                          onClick={() => handleDeliver(order)}
                          icon={<CheckCircle2 className="w-4 h-4" />}
                        >
                          Entregar y Sumar al Consumo (${order.totalAmount})
                        </LiquidButton>
                      </div>
                    )}
                  </LiquidGlassCard>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Tables Spend Ranking & Category Breakdown (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Table Spend Ranking */}
          <LiquidGlassCard variant="elevated" className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-pastel-yellow" />
                Ranking de Consumo
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Total Mesas</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {sortedTables.map((table, idx) => {
                const config = TIER_CONFIGS[table.tier];
                const progressToVip = Math.min(100, (table.totalSpend / 100) * 100);

                return (
                  <div key={table.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-400 font-mono w-4">
                          #{idx + 1}
                        </span>
                        <span className="font-extrabold text-white truncate max-w-[110px]">
                          {table.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-emerald-400 font-mono">
                          ${table.totalSpend}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold border ${config.badgeBg}`}>
                          {config.shortLabel}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar to $100 */}
                    <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pastel-lavender to-emerald-400 transition-all"
                        style={{ width: `${progressToVip}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </LiquidGlassCard>

          {/* Sales by Category Breakdown */}
          <LiquidGlassCard variant="subtle" className="p-4 sm:p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <Wine className="w-4 h-4 text-pastel-pink" />
              Ventas por Categoría
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">👑 Combos VIP Gold:</span>
                <strong className="text-white font-mono">${categoryRevenue.combos_vip || 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">🍾 Botellas Premium:</span>
                <strong className="text-white font-mono">${categoryRevenue.botellas || 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">🍸 Cócteles de Autor:</span>
                <strong className="text-white font-mono">${categoryRevenue.cocteles || 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">🍻 Shots & Cervezas:</span>
                <strong className="text-white font-mono">${categoryRevenue.shots_cervezas || 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">🍟 Piqueos & Snacks:</span>
                <strong className="text-white font-mono">${categoryRevenue.piqueos || 0}</strong>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      </div>
    </div>
  );
};
