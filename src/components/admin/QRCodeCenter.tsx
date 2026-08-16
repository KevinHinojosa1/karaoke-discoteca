import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer, ExternalLink, KeyRound } from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';
import { signTableUrl } from '../../utils/security';

export const QRCodeCenter: React.FC = () => {
  const { state, setActiveTableId, setActiveView } = useKaraoke();

  const tablesList = Object.values(state.tables);
  const origin = window.location.origin + window.location.pathname;

  const handlePrint = () => {
    window.print();
  };

  const getTableUrl = (tableId: string, token: string) => {
    return signTableUrl(origin, tableId, token);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <QrCode className="w-5 h-5 text-pastel-lavender" />
            Centro de Códigos QR y PINs de Seguridad
          </h3>
          <p className="text-xs text-slate-400">
            Cada sticker incluye un enlace con firma criptográfica y el PIN de 4 dígitos para evitar suplantación de mesa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LiquidButton
            variant="lavender"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4" />}
          >
            Imprimir Stickers QR y PINs
          </LiquidButton>
        </div>
      </div>

      {/* Tables QR Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tablesList.map((table) => {
          const config = TIER_CONFIGS[table.tier];
          const qrUrl = getTableUrl(table.id, table.sessionToken);

          return (
            <LiquidGlassCard
              key={table.id}
              variant="elevated"
              className="p-5 flex flex-col items-center text-center relative overflow-hidden group border border-white/20"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-sm font-extrabold text-white">
                  {table.name}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${config.badgeBg}`}
                >
                  {config.shortLabel}
                </span>
              </div>

              {/* QR Code Container styled with light background */}
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
              <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 flex items-center gap-2 text-xs">
                <KeyRound className="w-3.5 h-3.5 text-pastel-mint" />
                <span className="text-slate-400">PIN de Mesa:</span>
                <strong className="text-pastel-mint font-mono text-sm tracking-wider font-black">
                  {table.pin}
                </strong>
              </div>

              <div className="mt-2 text-[11px] font-mono text-slate-400">
                ID: <strong className="text-white">{table.id}</strong>
              </div>

              {/* Action */}
              <div className="mt-3 pt-3 border-t border-white/10 w-full flex items-center justify-center">
                <button
                  onClick={() => {
                    setActiveTableId(table.id);
                    setActiveView('user');
                  }}
                  className="text-xs text-pastel-lavender hover:underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir vista móvil de esta mesa
                </button>
              </div>
            </LiquidGlassCard>
          );
        })}
      </div>
    </div>
  );
};
