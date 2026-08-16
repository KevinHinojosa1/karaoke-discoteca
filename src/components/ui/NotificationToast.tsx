import React from 'react';
import { Bell, Sparkles, X, Mic2, ArrowUpRight } from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from './LiquidGlassCard';

export const NotificationToast: React.FC = () => {
  const { state, activeTableId, dismissNotification } = useKaraoke();

  // Find active notifications for this specific table or general notifications
  const tableNotifications = state.notifications.filter(
    (n) => n.tableId === activeTableId && !n.read
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
        return 'border-pastel-lavender/40 bg-pastel-lavender/20 text-pastel-lavender';
      default:
        return 'border-pastel-sky/40 bg-pastel-sky/20 text-pastel-sky';
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <LiquidGlassCard
        variant="elevated"
        className="p-4 border-2 border-pastel-lavender/30 shadow-glow-lavender"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${getBadgeColor(
              activeNotif.type
            )}`}
          >
            {activeNotif.type === 'now_playing' ? (
              <Mic2 className="w-5 h-5 animate-bounce" />
            ) : activeNotif.type === 'turn_soon' ? (
              <Bell className="w-5 h-5 animate-pulse" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white tracking-tight">
                {activeNotif.title}
              </h4>
              <button
                onClick={() => dismissNotification(activeNotif.id)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
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
