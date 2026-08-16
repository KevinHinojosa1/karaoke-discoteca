import React from 'react';
import { Bell, Sparkles, X, Mic2, ArrowUpRight, Wine, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from './LiquidGlassCard';

export const NotificationToast: React.FC = () => {
  const { state, activeTableId, dismissNotification } = useKaraoke();

  // Find active notifications for this specific table or general notifications
  const tableNotifications = state.notifications.filter(
    (n) => (n.tableId === activeTableId || n.tableId === 'all') && !n.read
  );

  if (tableNotifications.length === 0) return null;

  const activeNotif = tableNotifications[0];

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'now_playing':
        return 'border-pastel-pink/40 bg-pastel-pink/20 text-pastel-pink';
      case 'turn_soon':
        return 'border-pastel-mint/40 bg-pastel-mint/20 text-pastel-mint';
      case 'tier_upgraded':
        return 'border-pastel-yellow/40 bg-pastel-yellow/20 text-pastel-yellow';
      case 'order_delivered':
        return 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300';
      case 'order_received':
        return 'border-amber-400/40 bg-amber-500/20 text-amber-300';
      default:
        return 'border-pastel-sky/40 bg-pastel-sky/20 text-pastel-sky';
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'now_playing':
        return <Mic2 className="w-5 h-5 animate-bounce" />;
      case 'turn_soon':
        return <Bell className="w-5 h-5 animate-pulse" />;
      case 'order_delivered':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'order_received':
        return <Wine className="w-5 h-5 text-amber-300" />;
      case 'info':
        return <AlertCircle className="w-5 h-5 text-rose-300" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed top-4 inset-x-3 sm:top-auto sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 z-50 animate-in slide-in-from-top-4 sm:slide-in-from-bottom-5 duration-300">
      <LiquidGlassCard
        variant="elevated"
        className="p-4 border-2 border-pastel-lavender/40 shadow-glow-lavender"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${getBadgeColor(
              activeNotif.type
            )}`}
          >
            {renderIcon(activeNotif.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-black text-white tracking-tight">
                {activeNotif.title}
              </h4>
              <button
                onClick={() => dismissNotification(activeNotif.id)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {activeNotif.message}
            </p>
          </div>
        </div>

        {activeNotif.type === 'now_playing' && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex justify-end">
            <span className="text-[11px] font-semibold text-pastel-pink flex items-center gap-1 animate-pulse">
              ¡Sube a la tarima con el DJ! <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        )}
      </LiquidGlassCard>
    </div>
  );
};
