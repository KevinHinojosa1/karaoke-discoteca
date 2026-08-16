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

export interface InvoiceCustomer {
  type: 'final_consumer' | 'with_data';
  taxId: string; // Cédula / RUC (e.g. 9999999999999 or 0928374651001)
  name: string; // e.g. "Consumidor Final" or "Kevin Hinojosa"
  email?: string;
  phone?: string;
  address?: string;
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // e.g. "FAC-001-001-000000101"
  tableId: string;
  tableName: string;
  orderIds?: string[];
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // 0.15 (15% IVA)
  taxAmount: number;
  tipAmount?: number;
  total: number;
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'transfer';
  createdAt: number;
  issuedBy: string;
}

export interface Expense {
  id: string; // e.g. "EGR-001"
  description: string;
  category: 'meseros' | 'guardias' | 'dj' | 'barra_insumos' | 'varios';
  amount: number;
  recipientName?: string;
  createdAt: number;
  notes?: string;
  registeredBy: string;
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
  invoices: Invoice[];
  expenses: Expense[];
  prizes: RoulettePrize[];
  notifications: AppNotification[];
  cooldownDefaultMinutes: number;
  activeView: 'user' | 'admin' | 'stage';
  currentTableId: string;
  deviceAuthorizations: Record<string, TableDeviceAuth>; // tableId -> auth state
}
