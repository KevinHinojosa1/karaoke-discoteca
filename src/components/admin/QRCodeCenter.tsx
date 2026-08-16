import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, ExternalLink, KeyRound, Copy, Check } from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';
import { signTableUrl } from '../../utils/security';
import { Table } from '../../types';

export const QRCodeCenter: React.FC = () => {
  const { state, setActiveTableId, setActiveView } = useKaraoke();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tablesList = Object.values(state.tables);
  const origin = window.location.origin + window.location.pathname;

  const getTableUrl = (tableId: string, token: string) => {
    return signTableUrl(origin, tableId, token);
  };

  const handleCopyLink = (table: Table) => {
    const url = getTableUrl(table.id, table.sessionToken);
    navigator.clipboard.writeText(url);
    setCopiedId(table.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Dedicated Clean Print Engine for QR Sticker Sheets (Pure White Background, Crisp Black Labels)
  const handlePrintAllStickers = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    // Extract SVGs from current DOM or generate clean printable labels
    const stickersHtml = tablesList
      .map((table) => {
        const qrUrl = getTableUrl(table.id, table.sessionToken);
        const encodedQrUrl = encodeURIComponent(qrUrl);
        // Using high-contrast SVG QR via api.qrserver.com or inline SVG for instant printing
        const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodedQrUrl}&margin=2`;

        return `
        <div class="sticker-card">
          <div class="sticker-header">
            <div class="brand">KARAOKE HINOJOSA</div>
            <div class="table-title">${table.name}</div>
            <div class="table-id">ID: ${table.id}</div>
          </div>

          <div class="qr-box">
            <img src="${qrImgSrc}" alt="QR ${table.name}" class="qr-image" />
          </div>

          <div class="pin-container">
            <span class="pin-label">PIN DE SEGURIDAD:</span>
            <div class="pin-code">${table.pin}</div>
          </div>

          <div class="instructions">
            1. Escanea con tu cámara • 2. Ingresa el PIN • 3. Pide canciones & combos
          </div>
        </div>
      `;
      })
      .join('');

    const documentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stickers QR de Mesas - Karaoke Hinojosa</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #000000;
            margin: 0;
            padding: 10px;
          }
          .header-bar {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .sticker-card {
            border: 2px dashed #333333;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            background: #ffffff;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
          }
          .brand {
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 2px;
            color: #555555;
            text-transform: uppercase;
          }
          .table-title {
            font-size: 20px;
            font-weight: 900;
            color: #000000;
            margin: 4px 0 2px 0;
          }
          .table-id {
            font-size: 11px;
            font-family: monospace;
            color: #666666;
          }
          .qr-box {
            margin: 12px 0;
            padding: 8px;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
          }
          .qr-image {
            width: 160px;
            height: 160px;
            display: block;
          }
          .pin-container {
            background: #f0f0f0;
            border: 1px solid #cccccc;
            border-radius: 8px;
            padding: 6px 16px;
            margin: 6px 0;
            width: 80%;
          }
          .pin-label {
            font-size: 9px;
            font-weight: bold;
            color: #555555;
            display: block;
          }
          .pin-code {
            font-size: 22px;
            font-weight: 900;
            font-family: monospace;
            letter-spacing: 4px;
            color: #000000;
          }
          .instructions {
            font-size: 9px;
            color: #444444;
            margin-top: 6px;
            line-height: 1.3;
          }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-bar no-print">
          <h2 style="margin:0;">Stickers de Mesas y Códigos QR - Karaoke Hinojosa</h2>
          <p style="margin:4px 0; font-size:12px; color:#555;">Imprime en papel adhesivo o cartulina para los atriles de mesa.</p>
          <button onclick="window.print()" style="padding:8px 20px; font-weight:bold; background:#000; color:#fff; border:none; border-radius:6px; cursor:pointer; margin-top:5px;">
            🖨️ Mandar a Imprimir Ahora
          </button>
        </div>

        <div class="grid">
          ${stickersHtml}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(documentHtml);
    printWindow.document.close();
  };

  // Print Single Table Sticker
  const handlePrintSingleSticker = (table: Table) => {
    const printWindow = window.open('', '_blank', 'width=450,height=600');
    if (!printWindow) {
      window.print();
      return;
    }

    const qrUrl = getTableUrl(table.id, table.sessionToken);
    const encodedQrUrl = encodeURIComponent(qrUrl);
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedQrUrl}&margin=2`;

    const singleHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sticker ${table.name} - Karaoke Hinojosa</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #ffffff;
            color: #000;
            padding: 20px;
            text-align: center;
          }
          .card {
            border: 3px dashed #000;
            border-radius: 16px;
            padding: 24px;
            max-width: 320px;
            margin: 0 auto;
          }
          .brand { font-size: 12px; font-weight: 900; letter-spacing: 2px; color: #555; }
          .title { font-size: 24px; font-weight: 900; margin: 6px 0; }
          .id { font-size: 13px; font-family: monospace; color: #666; }
          .qr { width: 180px; height: 180px; margin: 16px auto; display: block; }
          .pin-box { background: #f0f0f0; border: 1px solid #bbb; border-radius: 10px; padding: 8px; margin: 10px 0; }
          .pin-title { font-size: 10px; font-weight: bold; color: #555; }
          .pin-num { font-size: 26px; font-weight: 900; font-family: monospace; letter-spacing: 4px; }
          .help { font-size: 11px; color: #444; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">KARAOKE HINOJOSA</div>
          <div class="title">${table.name}</div>
          <div class="id">ID: ${table.id}</div>
          <img src="${qrImgSrc}" class="qr" alt="QR" />
          <div class="pin-box">
            <div class="pin-title">PIN DE ACCESO:</div>
            <div class="pin-num">${table.pin}</div>
          </div>
          <div class="help">
            1. Escanea el código QR con tu celular<br>
            2. Ingresa el PIN de seguridad<br>
            3. Pide canciones y combos de barra
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(singleHtml);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-pastel-lavender" />
            Centro de Códigos QR, Stickers y PINs
          </h3>
          <p className="text-xs text-slate-400">
            Imprime las hojas de stickers en blanco y negro de alta resolución para los atriles de cada mesa.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <LiquidButton
            variant="lavender"
            size="md"
            onClick={handlePrintAllStickers}
            icon={<Printer className="w-4 h-4" />}
          >
            🖨️ Imprimir Todos los Stickers de Mesas (A4)
          </LiquidButton>
        </div>
      </div>

      {/* Tables QR Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tablesList.map((table) => {
          const config = TIER_CONFIGS[table.tier];
          const qrUrl = getTableUrl(table.id, table.sessionToken);
          const isCopied = copiedId === table.id;

          return (
            <LiquidGlassCard
              key={table.id}
              variant="elevated"
              className="p-5 flex flex-col items-center text-center relative overflow-hidden group border border-white/20"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-sm font-extrabold text-white truncate">
                  {table.name}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${config.badgeBg}`}
                >
                  {config.shortLabel}
                </span>
              </div>

              {/* QR Code Container styled with crisp white background */}
              <div className="p-3.5 bg-white rounded-2xl shadow-liquid-sm my-2 flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                <QRCodeSVG
                  value={qrUrl}
                  size={140}
                  level="H"
                  includeMargin={false}
                  fgColor="#0a0a14"
                />
              </div>

              {/* 4-digit PIN for Physical Sticker */}
              <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 flex items-center gap-2 text-xs w-full justify-between">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-pastel-mint" />
                  <span className="text-slate-400">PIN:</span>
                </div>
                <strong className="text-pastel-mint font-mono text-sm tracking-widest font-black">
                  {table.pin}
                </strong>
              </div>

              {/* Quick Actions Row */}
              <div className="mt-3 pt-3 border-t border-white/10 w-full flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handlePrintSingleSticker(table)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 transition-all tap-squish flex-1 justify-center"
                  title="Imprimir solo el sticker de esta mesa"
                >
                  <Printer className="w-3.5 h-3.5 text-pastel-lavender" />
                  <span>Imprimir</span>
                </button>

                <button
                  onClick={() => handleCopyLink(table)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all tap-squish"
                  title="Copiar enlace de esta mesa"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-pastel-mint" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => {
                    setActiveTableId(table.id);
                    setActiveView('user');
                  }}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all tap-squish"
                  title="Abrir vista móvil de esta mesa"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>
    </div>
  );
};
