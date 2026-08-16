import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Users,
  X,
  Copy,
  Check,
  Lock,
  LogOut,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { signTableUrl } from '../../utils/security';

export const HostInvitationBadge: React.FC = () => {
  const {
    currentTable,
    activeTableId,
    currentDeviceAuth,
    lockTableSession,
  } = useKaraoke();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!currentTable || !currentDeviceAuth?.isUnlocked) return null;

  const origin = window.location.origin + window.location.pathname;
  const inviteUrl = signTableUrl(origin, activeTableId, currentTable.sessionToken);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-slate-300 font-medium">
            Celular Vinculado a {currentTable.name}
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
            PIN Activo
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-2.5 py-1 rounded-xl bg-pastel-lavender/15 hover:bg-pastel-lavender/25 text-pastel-lavender border border-pastel-lavender/30 text-[11px] font-bold flex items-center gap-1 transition-all tap-squish"
          >
            <Users className="w-3 h-3" />
            <span>Compartir</span>
          </button>

          <button
            onClick={() => lockTableSession(activeTableId)}
            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
            title="Desvincular celular de esta mesa"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-night-base/85 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="w-full max-w-sm">
            <LiquidGlassCard variant="elevated" className="p-6 relative text-center">
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 mx-auto rounded-2xl bg-pastel-lavender/20 border border-pastel-lavender/30 flex items-center justify-center text-pastel-lavender mb-3">
                <Users className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white">
                Invitar Amigos de tu Mesa
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Tus amigos pueden pedir canciones compartiendo el cupo de tu mesa
              </p>

              {/* QR Code Container */}
              <div className="my-5 p-3.5 bg-white rounded-2xl shadow-liquid-sm inline-block">
                <QRCodeSVG value={inviteUrl} size={150} level="M" fgColor="#0a0a14" />
              </div>

              {/* 4-digit PIN Box */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs mb-4">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-pastel-mint" /> PIN de Mesa:
                </span>
                <span className="font-mono text-base font-black text-pastel-mint tracking-wider">
                  {currentTable.pin}
                </span>
              </div>

              {/* Copy Link Button */}
              <LiquidButton
                variant="lavender"
                size="md"
                fullWidth
                onClick={handleCopyLink}
                icon={copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? '¡Enlace Seguro Copiado!' : 'Copiar Enlace Autorizado'}
              </LiquidButton>
            </LiquidGlassCard>
          </div>
        </div>
      )}
    </>
  );
};
