export type ConsumptionTier = 'vip_100' | 'medium_50' | 'standard';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type SongStatus = 'pending' | 'playing' | 'completed' | 'cancelled';

export interface TierConfig {
  tier: ConsumptionTier;
  label: string;
  shortLabel: string;
  minSpend: number;
  maxSongs: number;
  priority: PriorityLevel;
  cooldownMinutes: number;
  badgeBg: string;
  badgeText: string;
  glowClass: string;
}

export interface RoulettePrize {
  id: string;
  title: string;
  description: string;
  type: 'time_reduction' | 'extra_song' | 'drink_discount' | 'no_prize';
  value: number; // e.g. 10 (minutes), 1 (song), 20 (percent discount), 0
  weight: number; // probability weight (e.g. 30, 20, 10, 40)
  color: string; // pastel color hex
  icon: string;
  active: boolean;
}

export interface Table {
  id: string;
  name: string;
  tier: ConsumptionTier;
  totalSpend: number;
  quotaUsed: number;
  extraQuotaBonus: number;
  cooldownUntil: number | null; // Timestamp ms when cooldown expires
  lastRequestAt: number | null;
  pin: string; // 4-digit security PIN (e.g. "4912")
  sessionToken: string; // Cryptographic session signature
  sessionCreatedAt: number;
  isLocked?: boolean; // DJ can lock the table if abandoned
  authorizedDevices?: string[];
  rewardsWon: Array<{
    id: string;
    prizeId: string;
    title: string;
    description: string;
    timestamp: number;
  }>;
  customCooldownMinutes?: number;
}

export interface SongRequest {
  id: string;
  tableId: string;
  tableName: string;
  title: string;
  artist: string;
  notes?: string;
  tier: ConsumptionTier;
  priority: PriorityLevel;
  status: SongStatus;
  createdAt: number;
  startedPlayingAt?: number;
  completedAt?: number;
  estimatedWaitMinutes?: number;
}

export interface BarOrderItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  includes?: string[];
}

export interface BarOrder {
  id: string;
  tableId: string;
  tableName: string;
  items: BarOrderItem[];
  totalAmount: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: number;
  deliveredAt?: number;
  isVipQualifying?: boolean;
  cancellationReason?: string;
  refundedAmount?: number;
  creditNoteId?: string;
}

export interface CreditNote {
  id: string; // e.g. "NC-2026-001"
  orderId: string;
  tableId: string;
  tableName: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  authorizedBy: string;
  createdAt: number;
  itemsReturned?: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface AppNotification {
  id: string;
  tableId: string;
  type: 'turn_soon' | 'now_playing' | 'tier_upgraded' | 'roulette_win' | 'order_received' | 'order_delivered' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface TableDeviceAuth {
  isUnlocked: boolean;
  isHost: boolean;
  unlockedAt: number;
  token: string;
}

export interface KaraokeState {
  tables: Record<string, Table>;
  queue: SongRequest[];
  currentSong: SongRequest | null;
  history: SongRequest[];
  orders: BarOrder[];
  creditNotes: CreditNote[];
  prizes: RoulettePrize[];
  notifications: AppNotification[];
  cooldownDefaultMinutes: number;
  activeView: 'user' | 'admin' | 'stage';
  currentTableId: string;
  deviceAuthorizations: Record<string, TableDeviceAuth>; // tableId -> auth state
}
