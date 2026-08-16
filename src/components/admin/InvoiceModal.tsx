import React, { useState } from 'react';
import {
  FileText,
  Printer,
  X,
  Building,
  User,
  CheckCircle2,
  Receipt,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { BarOrder, Invoice, Table } from '../../types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  table?: Table | null;
  order?: BarOrder | null;
  onInvoiceGenerated?: (invoiceId: string) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  table,
  order,
  onInvoiceGenerated,
}) => {
  const { state, generateInvoice } = useKaraoke();

  const [invoiceType, setInvoiceType] = useState<'final_consumer' | 'with_data'>('final_consumer');
  const [taxId, setTaxId] = useState('9999999999999');
  const [customerName, setCustomerName] = useState('Consumidor Final');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Invoice['paymentMethod']>('cash');
  const [tip, setTip] = useState('0');

  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  if (!isOpen) return null;

  // Determine items and amounts
  const targetTableId = table?.id || order?.tableId || state.currentTableId;
  const targetTableName = table?.name || order?.tableName || `Mesa ${targetTableId}`;

  const tableDeliveredOrders = (state.orders || []).filter(
    (o) => o.tableId === targetTableId && o.status === 'delivered'
  );

  let rawTotal = 0;
  let itemsList: { name: string; quantity: number; unitPrice: number; total: number }[] = [];

  if (order) {
    rawTotal = order.totalAmount;
    itemsList = order.items.map((i) => ({
      name: i.name,
      quantity: i.quantity,
      unitPrice: Math.round((i.price / 1.15) * 100) / 100,
      total: i.price * i.quantity,
    }));
  } else if (table) {
    rawTotal = table.totalSpend > 0 ? table.totalSpend : 0;
    if (tableDeliveredOrders.length > 0) {
      tableDeliveredOrders.forEach((ord) => {
        ord.items.forEach((i) => {
          itemsList.push({
            name: i.name,
            quantity: i.quantity,
            unitPrice: Math.round((i.price / 1.15) * 100) / 100,
            total: i.price * i.quantity,
          });
        });
      });
    } else {
      itemsList.push({
        name: `Consumo Total en Barra - ${targetTableName}`,
        quantity: 1,
        unitPrice: Math.round((rawTotal / 1.15) * 100) / 100,
        total: rawTotal,
      });
    }
  }

  const tipNum = parseFloat(tip) || 0;
  const grandTotal = rawTotal + tipNum;
  const subtotalNet = Math.round((rawTotal / 1.15) * 100) / 100;
  const taxIva15 = Math.round((rawTotal - subtotalNet) * 100) / 100;

  const handleTypeChange = (type: 'final_consumer' | 'with_data') => {
    setInvoiceType(type);
    if (type === 'final_consumer') {
      setTaxId('9999999999999');
      setCustomerName('Consumidor Final');
    } else {
      setTaxId('');
      setCustomerName('');
    }
  };

  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();

    if (invoiceType === 'with_data') {
      if (!taxId.trim() || !customerName.trim()) {
        alert('Por favor completa el RUC/Cédula y Nombre o Razón Social del cliente.');
        return;
      }
    }

    const res = generateInvoice({
      tableId: targetTableId,
      tableName: targetTableName,
      orderIds: order ? [order.id] : tableDeliveredOrders.map((o) => o.id),
      customer: {
        type: invoiceType,
        taxId: taxId.trim(),
        name: customerName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      },
      items: itemsList,
      subtotal: subtotalNet,
      taxRate: 0.15,
      taxAmount: taxIva15,
      tipAmount: tipNum,
      total: grandTotal,
      paymentMethod,
      issuedBy: 'Administrador (Kevin Hinojosa)',
    });

    if (res.success) {
      const generated = (state.invoices || []).find((i) => i.id === res.invoiceId) || {
        id: res.invoiceId,
        tableId: targetTableId,
        tableName: targetTableName,
        customer: {
          type: invoiceType,
          taxId: taxId.trim(),
          name: customerName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
        },
        items: itemsList,
        subtotal: subtotalNet,
        taxRate: 0.15,
        taxAmount: taxIva15,
        tipAmount: tipNum,
        total: grandTotal,
        paymentMethod,
        createdAt: Date.now(),
        issuedBy: 'Administrador (Kevin Hinojosa)',
      };

      setCreatedInvoice(generated);
      if (onInvoiceGenerated) onInvoiceGenerated(res.invoiceId);
    }
  };

  const handlePrintThermalReceipt = (inv: Invoice) => {
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
          body {
            font-family: 'Courier New', monospace;
            width: 320px;
            margin: 0 auto;
            padding: 10px;
            font-size: 12px;
            color: #000;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .double-divider { border-top: 2px dashed #000; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { vertical-align: top; }
          @media print {
            body { width: 100%; }
          }
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
            ${inv.items
              .map(
                (item) => `
              <tr>
                <td>${item.quantity}</td>
                <td>${item.name}</td>
                <td class="text-right">$${item.total.toFixed(2)}</td>
              </tr>
            `
              )
              .join('')}
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
          ${
            inv.tipAmount && inv.tipAmount > 0
              ? `
          <tr>
            <td>PROPINA / SERVICIO:</td>
            <td class="text-right">$${inv.tipAmount.toFixed(2)}</td>
          </tr>
          `
              : ''
          }
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
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col">
        <LiquidGlassCard variant="elevated" className="p-5 sm:p-6 relative flex flex-col max-h-full overflow-hidden border-pastel-lavender/40">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-3 flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center justify-center shadow-glow-mint">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                SISTEMA DE FACTURACIÓN
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Factura para {targetTableName}
              </h3>
              <p className="text-xs text-slate-400">
                Genera comprobante con datos del cliente o Consumidor Final
              </p>
            </div>
          </div>

          {/* Success / Printable Invoice Screen */}
          {createdInvoice ? (
            <div className="space-y-4 overflow-y-auto pr-1 py-1 flex-1">
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-black text-white">
                  ¡Factura {createdInvoice.id} Generada con Éxito!
                </h4>
                <p className="text-xs text-slate-300">
                  Emitida para {createdInvoice.customer.name} (RUC/CI: {createdInvoice.customer.taxId})
                </p>
              </div>

              {/* Invoice Breakdown Preview */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400 pb-1 border-b border-white/10">
                  <span>Detalle de Consumo</span>
                  <span>Total</span>
                </div>
                {createdInvoice.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300">
                    <span>{it.quantity}x {it.name}</span>
                    <span>${it.total.toFixed(2)}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/10 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal 15%:</span>
                    <span>${createdInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>IVA 15%:</span>
                    <span>${createdInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  {createdInvoice.tipAmount ? (
                    <div className="flex justify-between text-slate-400">
                      <span>Propina / Servicio:</span>
                      <span>${createdInvoice.tipAmount.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-base font-black text-emerald-400 pt-1 border-t border-white/10">
                    <span>TOTAL FACTURADO:</span>
                    <span>${createdInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <LiquidButton
                  variant="lavender"
                  size="md"
                  fullWidth
                  onClick={() => handlePrintThermalReceipt(createdInvoice)}
                  icon={<Printer className="w-4 h-4" />}
                >
                  Imprimir Ticket Térmico POS
                </LiquidButton>
                <LiquidButton
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setCreatedInvoice(null);
                    onClose();
                  }}
                >
                  Cerrar
                </LiquidButton>
              </div>
            </div>
          ) : (
            /* Invoice Generation Form */
            <form onSubmit={handleSubmitInvoice} className="space-y-3.5 overflow-y-auto pr-1 py-1 flex-1 no-scrollbar">
              {/* Type Switcher: Consumidor Final vs Con Datos */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => handleTypeChange('final_consumer')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    invoiceType === 'final_consumer'
                      ? 'bg-pastel-lavender/30 text-pastel-lavender border border-pastel-lavender/50 shadow-glow-lavender'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Consumidor Final</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('with_data')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    invoiceType === 'with_data'
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 shadow-glow-mint'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Factura con Datos (RUC)</span>
                </button>
              </div>

              {/* Customer Data Fields */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {invoiceType === 'with_data' ? 'RUC / Cédula / Pasaporte *' : 'Identificación'}
                    </label>
                    <input
                      type="text"
                      required
                      value={taxId}
                      readOnly={invoiceType === 'final_consumer'}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="0928374651001"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-pastel-lavender"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {invoiceType === 'with_data' ? 'Razón Social / Nombre Completo *' : 'Nombre del Cliente'}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      readOnly={invoiceType === 'final_consumer'}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Juan Pérez / Empresa S.A."
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
                    />
                  </div>
                </div>

                {invoiceType === 'with_data' && (
                  <div className="space-y-2.5 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Correo Electrónico (Factura Electrónica):
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="facturas@cliente.com"
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Teléfono de Contacto:
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="0987654321"
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Dirección Fiscal:
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Av. Samborondón / Guayaquil"
                          className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method & Tip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Método de Pago:
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-white text-xs focus:outline-none focus:border-pastel-lavender"
                  >
                    <option value="cash">💵 Efectivo</option>
                    <option value="credit_card">💳 Tarjeta de Crédito</option>
                    <option value="debit_card">💳 Tarjeta de Débito</option>
                    <option value="transfer">📱 Transferencia Bancaria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Propina / Servicio Voluntario ($):
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-pastel-lavender"
                  />
                </div>
              </div>

              {/* Totals Summary */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1 font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Sin Impuestos (15%):</span>
                  <span>${subtotalNet.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>IVA 15%:</span>
                  <span>${taxIva15.toFixed(2)}</span>
                </div>
                {tipNum > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Propina:</span>
                    <span>${tipNum.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-emerald-400 pt-1 border-t border-white/10">
                  <span>TOTAL A COBRAR:</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 flex-shrink-0">
                <LiquidButton type="button" variant="ghost" size="sm" onClick={onClose}>
                  Cancelar
                </LiquidButton>
                <LiquidButton
                  type="submit"
                  variant="mint"
                  size="md"
                  icon={<Receipt className="w-4 h-4" />}
                >
                  Generar e Imprimir Factura (${grandTotal.toFixed(2)})
                </LiquidButton>
              </div>
            </form>
          )}
        </LiquidGlassCard>
      </div>
    </div>
  );
};
