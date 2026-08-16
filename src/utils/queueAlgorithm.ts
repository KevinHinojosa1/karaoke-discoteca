import { ConsumptionTier, PriorityLevel, SongRequest, TierConfig } from '../types';

export const TIER_CONFIGS: Record<ConsumptionTier, TierConfig> = {
  vip_100: {
    tier: 'vip_100',
    label: 'VIP Gold (≥ $100)',
    shortLabel: 'VIP Gold',
    minSpend: 100,
    maxSongs: 5,
    priority: 'high',
    cooldownMinutes: 0,
    badgeBg: 'bg-gradient-to-r from-amber-400/20 to-yellow-300/30 border-amber-300/40 text-amber-200',
    badgeText: 'VIP $100+',
    glowClass: 'shadow-glow-yellow',
  },
  medium_50: {
    tier: 'medium_50',
    label: 'Premium ($50 - $99)',
    shortLabel: 'Premium $50+',
    minSpend: 50,
    maxSongs: 5,
    priority: 'medium',
    cooldownMinutes: 0,
    badgeBg: 'bg-gradient-to-r from-purple-400/20 to-indigo-300/30 border-purple-300/40 text-purple-200',
    badgeText: 'Medio $50-$99',
    glowClass: 'shadow-glow-lavender',
  },
  standard: {
    tier: 'standard',
    label: 'Estándar (< $100)',
    shortLabel: 'Estándar',
    minSpend: 0,
    maxSongs: 3,
    priority: 'low',
    cooldownMinutes: 15,
    badgeBg: 'bg-slate-700/40 border-slate-500/30 text-slate-300',
    badgeText: 'Sin Mínimo (<$100)',
    glowClass: 'shadow-sm',
  },
};

const PRIORITY_ORDER: Record<PriorityLevel, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Re-orders the pending songs queue:
 * 1. High priority > Medium priority > Low priority
 * 2. FIFO (First In, First Out by createdAt timestamp) within each priority tier
 */
export function sortQueueByPriority(queue: SongRequest[]): SongRequest[] {
  const pending = queue.filter((song) => song.status === 'pending');

  const sorted = [...pending].sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.priority] || 3;
    const priorityB = PRIORITY_ORDER[b.priority] || 3;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same priority, strict FIFO by creation time
    return a.createdAt - b.createdAt;
  });

  // Calculate estimated wait time (approx 3.5 minutes per song ahead)
  const SONG_AVG_MINUTES = 3.5;
  return sorted.map((song, index) => ({
    ...song,
    estimatedWaitMinutes: Math.max(1, Math.round((index + 1) * SONG_AVG_MINUTES)),
  }));
}

/**
 * Recalculates all song priorities when tables are upgraded/downgraded
 */
export function syncQueueWithTableTiers(
  queue: SongRequest[],
  tableTiers: Record<string, ConsumptionTier>
): SongRequest[] {
  const updated = queue.map((song) => {
    const tableTier = tableTiers[song.tableId] || song.tier || 'standard';
    const config = TIER_CONFIGS[tableTier];
    return {
      ...song,
      tier: tableTier,
      priority: config.priority,
    };
  });

  return sortQueueByPriority(updated);
}
