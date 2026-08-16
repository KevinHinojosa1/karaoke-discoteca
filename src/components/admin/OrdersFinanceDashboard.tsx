import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Wine,
  CheckCircle2,
  X,
  Crown,
  ShoppingBag,
  BellRing,
  Award,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  FileText,
  Calendar,
  Download,
  Printer,
  AlertTriangle,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { BarOrder, CreditNote, Invoice } from '../../types';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';
import { InvoiceModal } from './InvoiceModal';

export const OrdersFinanceDashboard: React.FC = () => {
  const {
    state,
    confirmAndDeliverOrder,
    cancelOrder,
    editOrder,
    deleteOrder,
    issueCreditNote,
    deleteCreditNote,
    deleteInvoice,
  } = useKaraoke();

  // Active Main Sub-Tab in Finance Dashboard
  const [activeFinanceTab, setActiveFinanceTab] = useState<'live_orders' | 'monthly_sales' | 'credit_notes' | 'invoices'>('live_orders');

  // Live Orders Status Filter
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');

  // Monthly Period Filter
  const [periodFilter, setPeriodFilter] = useState<'all_month' | 'this_week' | 'today'>('all_month');

  // Edit Order State
  const [editingOrder, setEditingOrder] = useState<BarOrder | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<BarOrder['status']>('pending');

  // Issue Credit Note Modal State
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [selectedOrderForCredit, setSelectedOrderForCredit] = useState<BarOrder | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('Admin Principal (Kevin)');

  // Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<BarOrder | null>(null);

  // View Voucher Modal
  const [viewingVoucher, setViewingVoucher] = useState<CreditNote | null>(null);

  const orders = state.orders || [];
  const creditNotes = state.creditNotes || [];
  const invoices = state.invoices || [];

  // Filter orders by date period
  const filteredOrdersByPeriod = useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;

    return orders.filter((o) => {
      const orderTime = o.deliveredAt || o.createdAt;
      if (periodFilter === 'today') {
        return now - orderTime < oneDayMs;
      }
      if (periodFilter === 'this_week') {
        return now - orderTime < sevenDaysMs;
      }
      return true; // all_month
    });
  }, [orders, periodFilter]);

  // Financial Metrics of the Period
  const deliveredOrders = filteredOrdersByPeriod.filter((o) => o.status === 'delivered');
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const cancelledOrders = filteredOrdersByPeriod.filter((o) => o.status === 'cancelled');

  const grossRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRefunds = creditNotes.reduce((sum, c) => sum + c.refundAmount, 0);
  const netRevenue = Math.max(0, grossRevenue - totalRefunds);
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderTicket = deliveredOrders.length > 0 ? Math.round(grossRevenue / deliveredOrders.length) : 0;

  // Tables sorted by spend
  const sortedTables = Object.values(state.tables).sort((a, b) => b.totalSpend - a.totalSpend);
  const topSpendingTable = sortedTables.length > 0 ? sortedTables[0] : null;

  // Category Breakdown for the period
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

  const handleDelete = (order: BarOrder) => {
    if (window.confirm(`¿Deseas ELIMINAR permanentemente la comanda de ${order.tableName} ($${order.totalAmount})? Si ya estaba entregada, se descontará del consumo de la mesa.`)) {
      deleteOrder(order.id);
    }
  };

  const handleOpenEdit = (order: BarOrder) => {
    setEditingOrder(order);
    setEditAmount(order.totalAmount.toString());
    setEditNotes(order.notes || '');
    setEditStatus(order.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const numAmount = parseFloat(editAmount) || 0;
    editOrder(editingOrder.id, {
      totalAmount: numAmount,
      notes: editNotes.trim() || undefined,
      status: editStatus,
    });

    setEditingOrder(null);
  };

  const handleOpenCreditNoteModal = (order: BarOrder) => {
    setSelectedOrderForCredit(order);
    setRefundAmount(order.totalAmount.toString());
    setRefundReason('Devolución de producto acordada con el cliente');
    setShowCreditNoteModal(true);
  };

  const handleConfirmCreditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForCredit) return;

    const numRefund = parseFloat(refundAmount) || 0;
    if (numRefund <= 0 || numRefund > selectedOrderForCredit.totalAmount) {
      alert(`El monto a devolver debe ser mayor a $0 y no superar el total de la orden ($${selectedOrderForCredit.totalAmount}).`);
      return;
    }

    const res = issueCreditNote(
      selectedOrderForCredit.id,
      numRefund,
      refundReason.trim() || 'Devolución de comanda',
      authorizedBy
    );

    if (res.success) {
      alert(`¡Nota de Crédito ${res.creditNoteId} emitida exitosamente por $${numRefund}! El saldo fue descontado del consumo de la mesa.`);
      setShowCreditNoteModal(false);
      setSelectedOrderForCredit(null);
      setActiveFinanceTab('credit_notes');
    }
  };

  const handleDeleteCreditNote = (note: CreditNote) => {
    if (window.confirm(`¿Eliminar la Nota de Crédito ${note.id} ($${note.refundAmount})? Esto repondrá el saldo al consumo de la mesa.`)) {
      deleteCreditNote(note.id);
    }
  };

  const handleOpenInvoiceModalForOrder = (order: BarOrder) => {
    setSelectedOrderForInvoice(order);
    setShowInvoiceModal(true);
  };

  const handlePrintThermalInvoice = (inv: Invoice) => {
    const printWindow = window.open('', '_blank', 'width=420,height=650');
    if (!printWindow) {
      window.print();
      return;
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${inv.id} - Karaoke Hinojosa</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 320px; margin: 0 auto; padding: 10px; font-size: 12px; color: #000; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .double-divider { border-top: 2px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { vertical-align: top; }
          @media print { body { width: 100%; } }
        </style>
      </head>
      <body>
        <div class="text-center">
          <h2 style="margin:0;">KARAOKE HINOJOSA</h2>
          <div>RUC: 0999999999001</div>
          <div>Matriz: Av. Principal & Bar Lounge</div>
          <div>Teléfono: (04) 289-4920</div>
          <div class="bold" style="margin-top:6px;">FACTURA ELECTRÓNICA</div>
          <div class="bold">${inv.id}</div>
        </div>

        <div class="divider"></div>

        <div><strong>Fecha:</strong> ${new Date(inv.createdAt).toLocaleString()}</div>
        <div><strong>Mesa:</strong> ${inv.tableName}</div>
        <div><strong>Cliente:</strong> ${inv.customer.name}</div>
        <div><strong>RUC/CI:</strong> ${inv.customer.taxId}</div>
        ${inv.customer.phone ? `<div><strong>Tel:</strong> ${inv.customer.phone}</div>` : ''}
        ${inv.customer.email ? `<div><strong>Email:</strong> ${inv.customer.email}</div>` : ''}
        ${inv.customer.address ? `<div><strong>Dirección:</strong> ${inv.customer.address}</div>` : ''}

        <div class="divider"></div>

        <table>
          <thead>
            <tr class="bold">
              <td style="width:15%;">Cant</td>
              <td style="width:60%;">Descripción</td>
              <td class="text-right" style="width:25%;">Total</td>
            </tr>
          </thead>
          <tbody>
            ${inv.items.map((item) => `
              <tr>
                <td>${item.quantity}</td>
                <td>${item.name}</td>
                <td class="text-right">$${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="divider"></div>

        <table>
          <tr>
            <td>SUBTOTAL 15%:</td>
            <td class="text-right">$${inv.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>IVA 15%:</td>
            <td class="text-right">$${inv.taxAmount.toFixed(2)}</td>
          </tr>
          ${inv.tipAmount ? `
          <tr>
            <td>PROPINA / SERVICIO:</td>
            <td class="text-right">$${inv.tipAmount.toFixed(2)}</td>
          </tr>` : ''}
          <tr class="bold" style="font-size:14px;">
            <td>TOTAL A PAGAR:</td>
            <td class="text-right">$${inv.total.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Forma de Pago:</td>
            <td class="text-right">${inv.paymentMethod.toUpperCase()}</td>
          </tr>
        </table>

        <div class="double-divider"></div>

        <div class="text-center" style="font-size:11px;">
          <div>¡Gracias por su visita y preferencia!</div>
          <div>Karaoke Hinojosa Night & Lounge</div>
          <div style="margin-top:6px; font-size:9px;">Autorización SRI: 1608202601099999999900120010010000001011234567819</div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    const headers = ['ID Comanda', 'Mesa', 'Fecha', 'Hora', 'Total Bruto', 'Estado', 'Devuelto / Nota Credito', 'Items'];
    const rows = filteredOrdersByPeriod.map((o) => [
      o.id,
      `"${o.tableName}"`,
      new Date(o.createdAt).toLocaleDateString(),
      new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      o.totalAmount,
      o.status,
      o.refundedAmount || 0,
      `"${o.items.map((i) => `${i.quantity}x ${i.name}`).join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_karaoke_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Ventas, Caja, Facturas & Notas de Crédito
          </h2>
          <p className="text-xs text-slate-300">
            Control de comandas en vivo, facturación legal (Consumidor Final / Con Datos) y devoluciones.
          </p>
        </div>

        {/* Sub-Tab Navigation Pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFinanceTab('live_orders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-squish flex items-center gap-1.5 whitespace-nowrap ${
              activeFinanceTab === 'live_orders'
                ? 'bg-pastel-lavender/30 text-pastel-lavender border border-pastel-lavender/50 shadow-glow-lavender'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Comandas en Vivo</span>
            {pendingOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-pastel-pink animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveFinanceTab('invoices')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-squish flex items-center gap-1.5 whitespace-nowrap ${
              activeFinanceTab === 'invoices'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-glow-mint'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Facturación ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveFinanceTab('monthly_sales')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-squish flex items-center gap-1.5 whitespace-nowrap ${
              activeFinanceTab === 'monthly_sales'
                ? 'bg-pastel-sky/25 text-pastel-sky border border-pastel-sky/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Ventas del Mes</span>
          </button>

          <button
            onClick={() => setActiveFinanceTab('credit_notes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all tap-squish flex items-center gap-1.5 whitespace-nowrap ${
              activeFinanceTab === 'credit_notes'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Notas de Crédito ({creditNotes.length})</span>
          </button>
        </div>
      </div>

      {/* Top Financial KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Metric 1: Net Real Revenue */}
        <LiquidGlassCard variant="elevated" className="p-4 border-emerald-400/40 shadow-glow-mint">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Ventas Netas Reales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono mt-1">
            ${netRevenue}
          </div>
          <span className="text-[10px] text-emerald-400/80 block">
            Bruto: ${grossRevenue} • {deliveredOrders.length} entregas
          </span>
        </LiquidGlassCard>

        {/* Metric 2: Credit Notes / Refunds */}
        <LiquidGlassCard variant="subtle" className="p-4 border-rose-400/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Devoluciones & NC</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-300 font-mono mt-1">
            -${totalRefunds}
          </div>
          <span className="text-[10px] text-rose-300/80 block">
            {creditNotes.length} notas de crédito emitidas
          </span>
        </LiquidGlassCard>

        {/* Metric 3: Pending Orders in Bar */}
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

        {/* Metric 4: Top Spender Table & Avg Ticket */}
        <LiquidGlassCard variant="subtle" className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Mesa Líder & Ticket</span>
            <TrendingUp className="w-4 h-4 text-pastel-sky" />
          </div>
          <div className="text-lg sm:text-xl font-black text-white truncate mt-1">
            {topSpendingTable?.name || 'N/A'}
          </div>
          <span className="text-[10px] text-amber-300 block font-bold font-mono">
            Ticket Prom: ${avgOrderTicket} • Net: ${topSpendingTable?.totalSpend || 0}
          </span>
        </LiquidGlassCard>
      </div>

      {/* VIEW 1: LIVE ORDERS QUEUE */}
      {activeFinanceTab === 'live_orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left: Orders List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-pastel-lavender" />
                Comandas en Barra
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
                </LiquidGlassCard>
              ) : (
                filteredOrders.map((order) => {
                  const isPending = order.status === 'pending';
                  const isDelivered = order.status === 'delivered';
                  const hasCreditNote = order.creditNoteId || (order.refundedAmount && order.refundedAmount > 0);

                  return (
                    <LiquidGlassCard
                      key={order.id}
                      variant={isPending ? 'lavender' : 'subtle'}
                      className={`p-4 sm:p-5 flex flex-col justify-between transition-all ${
                        isPending ? 'border-2 border-pastel-pink/50 shadow-glow-pink' : 'border-white/10'
                      }`}
                    >
                      <div>
                        {/* Header */}
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
                              {hasCreditNote && (
                                <span className="text-[9px] text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30 font-bold">
                                  Devolución: -${order.refundedAmount} ({order.creditNoteId})
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                              Hora: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Status & Amount */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
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

                            {/* Actions Menu */}
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleOpenEdit(order)}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                                title="Editar comanda"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(order)}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                                title="Eliminar comanda permanentemente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Items */}
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

                          {order.notes && (
                            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-pastel-mint italic mt-2">
                              💬 <strong>Nota del cliente:</strong> "{order.notes}"
                            </div>
                          )}

                          {order.status === 'cancelled' && order.cancellationReason && (
                            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 mt-2">
                              ⚠️ <strong>Motivo de cancelación:</strong> {order.cancellationReason}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Action Buttons */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                        {isDelivered && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => handleOpenInvoiceModalForOrder(order)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5 transition-all tap-squish"
                              title="Generar e imprimir factura electrónica para este pedido"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Emitir Factura</span>
                            </button>

                            <button
                              onClick={() => handleOpenCreditNoteModal(order)}
                              className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30 text-xs font-bold flex items-center gap-1.5 transition-all tap-squish"
                              title="Emitir devolución y nota de crédito para este pedido"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Nota de Crédito</span>
                            </button>
                          </div>
                        )}

                        {isPending && (
                          <div className="flex items-center justify-end gap-2 w-full">
                            <button
                              onClick={() => handleCancel(order)}
                              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
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
                      </div>
                    </LiquidGlassCard>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Table Spend Ranking & Categories (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <LiquidGlassCard variant="elevated" className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-pastel-yellow" />
                  Ranking de Consumo
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Mesas</span>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {sortedTables.map((table, idx) => {
                  const config = TIER_CONFIGS[table.tier];
                  const progressToVip = Math.min(100, (table.totalSpend / 101) * 100);

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

            {/* Sales by Category */}
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
      )}

      {/* VIEW 2: INVOICES REGISTRY */}
      {activeFinanceTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Comprobantes y Facturas Electrónicas Emitidas
              </h3>
              <p className="text-xs text-slate-400">
                Registro de facturas a Consumidor Final y con Datos Fiscales (RUC/Cédula).
              </p>
            </div>

            <LiquidButton
              variant="mint"
              size="sm"
              onClick={() => {
                setSelectedOrderForInvoice(null);
                setShowInvoiceModal(true);
              }}
              icon={<Receipt className="w-4 h-4" />}
            >
              + Nueva Factura Directa
            </LiquidButton>
          </div>

          {invoices.length === 0 ? (
            <LiquidGlassCard variant="subtle" className="p-8 text-center">
              <Receipt className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                No hay facturas emitidas todavía.
              </p>
            </LiquidGlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {invoices.map((inv) => (
                <LiquidGlassCard
                  key={inv.id}
                  variant="elevated"
                  className="p-4 sm:p-5 flex flex-col justify-between border-emerald-400/30"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/10">
                      <div>
                        <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                          {inv.id}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">
                          {inv.customer.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          RUC/CI: {inv.customer.taxId} • {inv.tableName}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-400 font-mono block">
                          ${inv.total.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase font-bold">
                          {inv.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 space-y-1 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span>Subtotal:</span>
                        <span>${inv.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>IVA 15%:</span>
                        <span>${inv.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[10px] pt-1">
                        <span>Fecha:</span>
                        <span>{new Date(inv.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handlePrintThermalInvoice(inv)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5 transition-all tap-squish flex-1 justify-center"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Reimprimir Ticket</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar registro de factura ${inv.id}?`)) {
                          deleteInvoice(inv.id);
                        }
                      }}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Eliminar factura"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: FULL MONTH SALES & AUDIT REPORT */}
      {activeFinanceTab === 'monthly_sales' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pastel-lavender" />
              <span className="text-xs font-bold text-white">Periodo de Ventas:</span>
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
                <button
                  onClick={() => setPeriodFilter('all_month')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    periodFilter === 'all_month' ? 'bg-pastel-lavender text-night-base font-bold' : 'text-slate-400'
                  }`}
                >
                  Todo el Mes
                </button>
                <button
                  onClick={() => setPeriodFilter('this_week')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    periodFilter === 'this_week' ? 'bg-pastel-lavender text-night-base font-bold' : 'text-slate-400'
                  }`}
                >
                  Esta Semana
                </button>
                <button
                  onClick={() => setPeriodFilter('today')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    periodFilter === 'today' ? 'bg-pastel-lavender text-night-base font-bold' : 'text-slate-400'
                  }`}
                >
                  Hoy
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5 transition-all tap-squish"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={handlePrintSummary}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all tap-squish"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Resumen</span>
              </button>
            </div>
          </div>

          {/* Full Transaction Audit Table */}
          <LiquidGlassCard variant="elevated" className="p-4 sm:p-5 overflow-hidden">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Libro Diario de Ventas y Comandas
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-mono">
                    <th className="py-2.5 px-3">ID / Fecha</th>
                    <th className="py-2.5 px-3">Mesa</th>
                    <th className="py-2.5 px-3">Detalle Productos</th>
                    <th className="py-2.5 px-3 text-right">Monto Bruto</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                    <th className="py-2.5 px-3 text-right">Ajuste / NC</th>
                    <th className="py-2.5 px-3 text-right">Monto Neto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium text-slate-300">
                  {filteredOrdersByPeriod.map((order) => {
                    const refund = order.refundedAmount || 0;
                    const net = Math.max(0, order.totalAmount - refund);

                    return (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-3 font-mono text-[11px]">
                          <strong className="text-white block">{order.id}</strong>
                          <span className="text-slate-400">
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <strong className="text-white">{order.tableName}</strong>
                          <span className="text-[10px] text-slate-400 block font-mono">{order.tableId}</span>
                        </td>
                        <td className="py-3 px-3">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-white">
                          ${order.totalAmount}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                              order.status === 'delivered'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : order.status === 'pending'
                                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {order.status === 'delivered' ? 'Entregado' : order.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-rose-300">
                          {refund > 0 ? `-$${refund}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-black text-emerald-400">
                          ${order.status === 'delivered' ? net : 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </LiquidGlassCard>
        </div>
      )}

      {/* VIEW 4: CREDIT NOTES & REFUNDS REGISTRY */}
      {activeFinanceTab === 'credit_notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Registro Oficial de Notas de Crédito y Devoluciones
              </h3>
              <p className="text-xs text-slate-400">
                Auditoría legal de anulación de comandas, reembolsos y ajustes de consumo.
              </p>
            </div>
          </div>

          {creditNotes.length === 0 ? (
            <LiquidGlassCard variant="subtle" className="p-8 text-center">
              <Receipt className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                No se han emitido notas de crédito aún.
              </p>
            </LiquidGlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {creditNotes.map((note) => (
                <LiquidGlassCard
                  key={note.id}
                  variant="elevated"
                  className="p-4 sm:p-5 border-rose-400/30 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-white/10">
                      <div>
                        <span className="text-xs font-mono font-black text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-400/30">
                          {note.id}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">
                          {note.tableName} ({note.tableId})
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Ref Comanda: #{note.orderId} • {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-rose-400 font-mono block">
                          -${note.refundAmount}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Original: ${note.originalAmount}
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Motivo de Devolución:</span>
                        <p className="text-white italic">"{note.reason}"</p>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Autorizado por:</span>
                        <p className="text-pastel-mint font-semibold">{note.authorizedBy}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setViewingVoucher(note)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-all tap-squish"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ver Vale / Imprimir</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCreditNote(note)}
                      className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Eliminar registro de nota de crédito"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: INVOICE GENERATOR MODAL */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setSelectedOrderForInvoice(null);
        }}
        order={selectedOrderForInvoice}
        onInvoiceGenerated={(_id) => {
          setActiveFinanceTab('invoices');
        }}
      />

      {/* MODAL: ISSUE CREDIT NOTE */}
      {showCreditNoteModal && selectedOrderForCredit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-md">
            <LiquidGlassCard variant="elevated" className="p-5 sm:p-6 relative border-rose-400/40">
              <button
                onClick={() => setShowCreditNoteModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Emitir Nota de Crédito / Devolución
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedOrderForCredit.tableName} • Comanda #{selectedOrderForCredit.id}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-200 mb-4 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  Al emitir esta nota de crédito, el valor se descontará del consumo registrado de la mesa y se registrará formalmente en el libro contable.
                </span>
              </div>

              <form onSubmit={handleConfirmCreditNote} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor a Devolver ($): (Monto Original: ${selectedOrderForCredit.totalAmount})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    max={selectedOrderForCredit.totalAmount}
                    min={1}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono font-bold text-sm focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Motivo Detallado de la Devolución:
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Ej. Botella cerrada devuelta por el cliente / Cambio de producto / Error de cobro"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Administrador que Autoriza:
                  </label>
                  <input
                    type="text"
                    required
                    value={authorizedBy}
                    onChange={(e) => setAuthorizedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <LiquidButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreditNoteModal(false)}
                  >
                    Cancelar
                  </LiquidButton>
                  <LiquidButton
                    type="submit"
                    variant="pink"
                    size="sm"
                    icon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Confirmar Devolución
                  </LiquidButton>
                </div>
              </form>
            </LiquidGlassCard>
          </div>
        </div>
      )}

      {/* MODAL: PRINTABLE VOUCHER */}
      {viewingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-sm">
            <LiquidGlassCard variant="elevated" className="p-6 relative text-center border-white/20">
              <button
                onClick={() => setViewingVoucher(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-400/30">
                VALE DE NOTA DE CRÉDITO
              </span>

              <h3 className="text-xl font-black text-white mt-2">Karaoke Hinojosa</h3>
              <p className="text-xs text-slate-400 font-mono">RUC: 0999999999001</p>

              <div className="my-4 p-3 rounded-2xl bg-white/5 border border-white/10 text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">N° Documento:</span>
                  <strong className="text-white">{viewingVoucher.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha:</span>
                  <span className="text-white">{new Date(viewingVoucher.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mesa:</span>
                  <span className="text-white">{viewingVoucher.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monto Devuelto:</span>
                  <strong className="text-rose-400 font-black text-sm">${viewingVoucher.refundAmount}</strong>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-slate-400 block">Motivo:</span>
                  <span className="text-white font-sans text-xs">{viewingVoucher.reason}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 block">Autorizado:</span>
                  <span className="text-pastel-mint font-sans text-xs">{viewingVoucher.authorizedBy}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-center pt-2">
                <LiquidButton
                  variant="lavender"
                  size="sm"
                  fullWidth
                  onClick={() => window.print()}
                  icon={<Printer className="w-3.5 h-3.5" />}
                >
                  Imprimir Comprobante
                </LiquidButton>
              </div>
            </LiquidGlassCard>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ORDER */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-sm">
            <LiquidGlassCard variant="elevated" className="p-5 sm:p-6 relative">
              <button
                onClick={() => setEditingOrder(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-base font-black text-white mb-1 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-pastel-lavender" />
                Editar Comanda ({editingOrder.tableName})
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Modifica el valor total, notas o estado del pedido.
              </p>

              <form onSubmit={handleSaveEdit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monto Total ($):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono font-bold text-sm focus:outline-none focus:border-pastel-lavender"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estado del Pedido:
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
                  >
                    <option value="pending">🟡 Pendiente (Por despachar)</option>
                    <option value="delivered">🟢 Entregado (Sumado al consumo)</option>
                    <option value="cancelled">🔴 Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notas / Instrucciones:
                  </label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Instrucciones del pedido..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <LiquidButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingOrder(null)}
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
    </div>
  );
};
