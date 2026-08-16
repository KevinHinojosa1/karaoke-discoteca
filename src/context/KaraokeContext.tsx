import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  AppNotification,
  ConsumptionTier,
  KaraokeState,
  RoulettePrize,
  SongRequest,
  Table,
  TableDeviceAuth,
} from '../types';
import {
  INITIAL_CURRENT_SONG,
  INITIAL_PRIZES,
  INITIAL_QUEUE,
  INITIAL_TABLES,
} from '../utils/mockData';
import { sortQueueByPriority, syncQueueWithTableTiers, TIER_CONFIGS } from '../utils/queueAlgorithm';
import { soundManager } from '../utils/audio';
import { sendBrowserNotification } from '../utils/pushNotifications';
import { generateSessionToken, generateTablePin } from '../utils/security';

interface KaraokeContextType {
  state: KaraokeState;
  currentTable: Table | undefined;
  activeTableId: string;
  setActiveTableId: (tableId: string) => void;
  activeView: 'user' | 'admin' | 'stage';
  setActiveView: (view: 'user' | 'admin' | 'stage') => void;
  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  showAdminLoginModal: boolean;
  setShowAdminLoginModal: (show: boolean) => void;
  
  // Security & Authentication Actions
  currentDeviceAuth: TableDeviceAuth | undefined;
  isTableAuthenticated: boolean;
  unlockTableWithPin: (
    tableId: string,
    pin: string,
    isHost?: boolean
  ) => { success: boolean; error?: string };
  lockTableSession: (tableId: string) => void;
  regenerateTableSession: (tableId: string) => { newPin: string; newToken: string };
  regenerateAllSessions: () => void;
  toggleTableLock: (tableId: string) => void;

  // Actions
  requestSong: (
    tableId: string,
    title: string,
    artist: string,
    notes?: string
  ) => { success: boolean; error?: string; song?: SongRequest; eligibleForRoulette?: boolean };
  
  setTableTier: (tableId: string, tier: ConsumptionTier, totalSpend?: number) => void;
  startSong: (songId: string) => void;
  completeCurrentSong: () => void;
  cancelSong: (songId: string) => void;
  reorderQueueManual: (newQueue: SongRequest[]) => void;
  spinRoulette: (tableId: string) => RoulettePrize;
  updatePrizes: (prizes: RoulettePrize[]) => void;
  addTable: (id: string, name: string, tier?: ConsumptionTier) => void;
  dismissNotification: (id: string) => void;
  resetAllData: () => void;
}

const STORAGE_KEY = 'karaoke_discoteca_state_v3';
const BROADCAST_NAME = 'karaoke_realtime_broadcast';

const KaraokeContext = createContext<KaraokeContextType | null>(null);

export const KaraokeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Parse URL parameters for initial table and token auth
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialTableParam = urlParams.get('mesa') || 'M-04';
  const initialAuthToken = urlParams.get('auth');

  const [state, setState] = useState<KaraokeState>(() => {
    // Check initial device auth from storage
    let initialAuths: Record<string, TableDeviceAuth> = {
      // By default M-04 is pre-authenticated for seamless demo testing if desired
      'M-04': {
        isUnlocked: true,
        isHost: true,
        unlockedAt: Date.now(),
        token: 'tk_m04_auth5b7f',
      },
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          currentTableId: initialTableParam in parsed.tables ? initialTableParam : 'M-04',
          activeView: urlParams.get('view') === 'admin' ? 'admin' : urlParams.get('view') === 'stage' ? 'stage' : 'user',
          deviceAuthorizations: parsed.deviceAuthorizations || initialAuths,
        };
      }
    } catch {
      // Fallback
    }

    return {
      tables: INITIAL_TABLES,
      queue: sortQueueByPriority(INITIAL_QUEUE),
      currentSong: INITIAL_CURRENT_SONG,
      history: [],
      prizes: INITIAL_PRIZES,
      notifications: [],
      cooldownDefaultMinutes: 15,
      activeView: urlParams.get('view') === 'admin' ? 'admin' : urlParams.get('view') === 'stage' ? 'stage' : 'user',
      currentTableId: initialTableParam in INITIAL_TABLES ? initialTableParam : 'M-04',
      deviceAuthorizations: initialAuths,
    };
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('karaoke_admin_auth') === 'true';
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  // Broadcast channel for real-time synchronization between tabs
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  useEffect(() => {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(BROADCAST_NAME);
      setChannel(bc);

      bc.onmessage = (event) => {
        if (event.data?.type === 'STATE_SYNC') {
          setState((prev) => ({
            ...event.data.payload,
            activeView: prev.activeView,
            currentTableId: prev.currentTableId,
            deviceAuthorizations: prev.deviceAuthorizations, // Keep local device auth
          }));
        }
      };

      return () => {
        bc.close();
      };
    }
  }, []);

  // Check URL Token Authentication on Mount
  useEffect(() => {
    if (initialAuthToken && state.tables[initialTableParam]) {
      const targetTable = state.tables[initialTableParam];
      if (targetTable.sessionToken === initialAuthToken) {
        // Valid token from secure QR scan! Auto-unlock this table for this device
        setState((prev) => {
          const updatedAuths = {
            ...prev.deviceAuthorizations,
            [initialTableParam]: {
              isUnlocked: true,
              isHost: true,
              unlockedAt: Date.now(),
              token: initialAuthToken,
            },
          };
          return {
            ...prev,
            deviceAuthorizations: updatedAuths,
          };
        });
      }
    }
  }, [initialAuthToken, initialTableParam]);

  // Save to localStorage and broadcast whenever state changes
  const updateStateAndBroadcast = useCallback((updater: (prev: KaraokeState) => KaraokeState) => {
    setState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        if (channel) {
          channel.postMessage({ type: 'STATE_SYNC', payload: next });
        }
      } catch (err) {
        console.error('Error broadcasting state:', err);
      }
      return next;
    });
  }, [channel]);

  const activeTableId = state.currentTableId;
  const currentTable = state.tables[activeTableId];

  // Device Authentication State for current table
  const currentDeviceAuth = state.deviceAuthorizations?.[activeTableId];
  const isTableAuthenticated = Boolean(
    currentDeviceAuth?.isUnlocked &&
    currentTable &&
    !currentTable.isLocked &&
    currentDeviceAuth.token === currentTable.sessionToken
  );

  const setActiveTableId = useCallback((tableId: string) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      currentTableId: tableId,
    }));
  }, [updateStateAndBroadcast]);

  const setActiveView = useCallback((view: 'user' | 'admin' | 'stage') => {
    setState((prev) => ({
      ...prev,
      activeView: view,
    }));
  }, []);

  // Unlock Table with 4-digit PIN
  const unlockTableWithPin = useCallback((
    tableId: string,
    pin: string,
    isHost = true
  ): { success: boolean; error?: string } => {
    const table = state.tables[tableId];
    if (!table) {
      return { success: false, error: 'Mesa no encontrada en el sistema.' };
    }

    if (table.isLocked) {
      return { success: false, error: 'Esta mesa ha sido bloqueada temporalmente por el DJ.' };
    }

    if (table.pin !== pin.trim()) {
      soundManager.playTap();
      return {
        success: false,
        error: `PIN de seguridad incorrecto. Revisa el atril de la ${table.name} o consulta con el mesero.`,
      };
    }

    // Success! Authorize device
    soundManager.playVictoryFanfare();

    setState((prev) => {
      const newAuths = {
        ...prev.deviceAuthorizations,
        [tableId]: {
          isUnlocked: true,
          isHost,
          unlockedAt: Date.now(),
          token: table.sessionToken,
        },
      };

      const updated = {
        ...prev,
        deviceAuthorizations: newAuths,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}

      return updated;
    });

    return { success: true };
  }, [state.tables]);

  // Lock / Relinquish Table session from client
  const lockTableSession = useCallback((tableId: string) => {
    setState((prev) => {
      const newAuths = { ...prev.deviceAuthorizations };
      delete newAuths[tableId];
      return {
        ...prev,
        deviceAuthorizations: newAuths,
      };
    });
  }, []);

  // DJ Panic Button: Regenerate Table PIN & Session Token (Expels all connected phones!)
  const regenerateTableSession = useCallback((tableId: string) => {
    const newPin = generateTablePin();
    const newToken = generateSessionToken(tableId, newPin);

    updateStateAndBroadcast((prev) => {
      const table = prev.tables[tableId];
      if (!table) return prev;

      const updatedTable: Table = {
        ...table,
        pin: newPin,
        sessionToken: newToken,
        sessionCreatedAt: Date.now(),
        isLocked: false,
      };

      // Clear local auth if we were on this table
      const newAuths = { ...prev.deviceAuthorizations };
      delete newAuths[tableId];

      return {
        ...prev,
        tables: {
          ...prev.tables,
          [tableId]: updatedTable,
        },
        deviceAuthorizations: newAuths,
      };
    });

    return { newPin, newToken };
  }, [updateStateAndBroadcast]);

  // DJ Global Action: Rotate all table tokens for the night
  const regenerateAllSessions = useCallback(() => {
    updateStateAndBroadcast((prev) => {
      const newTables: Record<string, Table> = {};

      Object.entries(prev.tables).forEach(([id, t]) => {
        const newPin = generateTablePin();
        const newToken = generateSessionToken(id, newPin);
        newTables[id] = {
          ...t,
          pin: newPin,
          sessionToken: newToken,
          sessionCreatedAt: Date.now(),
          isLocked: false,
        };
      });

      return {
        ...prev,
        tables: newTables,
        deviceAuthorizations: {}, // Clear all device auths club-wide
      };
    });
  }, [updateStateAndBroadcast]);

  // Toggle Table Lock (DJ freeze table)
  const toggleTableLock = useCallback((tableId: string) => {
    updateStateAndBroadcast((prev) => {
      const table = prev.tables[tableId];
      if (!table) return prev;

      return {
        ...prev,
        tables: {
          ...prev.tables,
          [tableId]: {
            ...table,
            isLocked: !table.isLocked,
          },
        },
      };
    });
  }, [updateStateAndBroadcast]);

  // Check turn notifications for users
  const notifyTurnStatus = useCallback((tableId: string, type: 'turn_soon' | 'now_playing' | 'tier_upgraded' | 'roulette_win' | 'info', title: string, message: string) => {
    soundManager.playNotificationChime();
    sendBrowserNotification(title, { body: message });

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tableId,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
    };

    updateStateAndBroadcast((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications].slice(0, 20),
    }));
  }, [updateStateAndBroadcast]);

  // Request a Song
  const requestSong = useCallback((
    tableId: string,
    title: string,
    artist: string,
    notes?: string
  ) => {
    const table = state.tables[tableId];
    if (!table) {
      return { success: false, error: 'Mesa no encontrada' };
    }

    if (table.isLocked) {
      return { success: false, error: 'Esta mesa se encuentra bloqueada por el DJ.' };
    }

    const tierConfig = TIER_CONFIGS[table.tier];
    const totalAllowed = tierConfig.maxSongs + table.extraQuotaBonus;

    // Check remaining quota
    if (table.quotaUsed >= totalAllowed) {
      return {
        success: false,
        error: `Has alcanzado el límite máximo de ${totalAllowed} canciones para tu categoría. Consulta con un mesero para aumentar tu consumo.`,
      };
    }

    // Check Cooldown timer for standard tier
    if (table.tier === 'standard' && table.cooldownUntil && table.cooldownUntil > Date.now()) {
      const remainingMinutes = Math.ceil((table.cooldownUntil - Date.now()) / (1000 * 60));
      return {
        success: false,
        error: `Debes esperar ${remainingMinutes} minuto(s) antes de solicitar otra canción.`,
      };
    }

    const newSong: SongRequest = {
      id: `song-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tableId: table.id,
      tableName: table.name,
      title: title.trim(),
      artist: artist.trim(),
      notes: notes?.trim() || undefined,
      tier: table.tier,
      priority: tierConfig.priority,
      status: 'pending',
      createdAt: Date.now(),
    };

    // Calculate new cooldown if standard
    const cooldownMs = table.tier === 'standard' ? (table.customCooldownMinutes || state.cooldownDefaultMinutes) * 60 * 1000 : 0;
    const newCooldownUntil = cooldownMs > 0 ? Date.now() + cooldownMs : null;

    updateStateAndBroadcast((prev) => {
      const updatedTable: Table = {
        ...prev.tables[tableId],
        quotaUsed: prev.tables[tableId].quotaUsed + 1,
        lastRequestAt: Date.now(),
        cooldownUntil: newCooldownUntil,
      };

      const updatedQueue = sortQueueByPriority([...prev.queue, newSong]);

      return {
        ...prev,
        tables: {
          ...prev.tables,
          [tableId]: updatedTable,
        },
        queue: updatedQueue,
      };
    });

    soundManager.playTap();

    // Standard tables are eligible for rewards roulette upon requesting
    const eligibleForRoulette = table.tier === 'standard';

    return {
      success: true,
      song: newSong,
      eligibleForRoulette,
    };
  }, [state.tables, state.cooldownDefaultMinutes, updateStateAndBroadcast]);

  // Set / Upgrade Table Tier
  const setTableTier = useCallback((tableId: string, tier: ConsumptionTier, totalSpend?: number) => {
    updateStateAndBroadcast((prev) => {
      const existing = prev.tables[tableId];
      if (!existing) return prev;

      const newSpend = totalSpend !== undefined ? totalSpend : tier === 'vip_100' ? Math.max(100, existing.totalSpend) : tier === 'medium_50' ? Math.max(50, existing.totalSpend) : existing.totalSpend;

      // Clear cooldown if upgraded to VIP or Medium
      const newCooldownUntil = (tier === 'vip_100' || tier === 'medium_50') ? null : existing.cooldownUntil;

      const updatedTable: Table = {
        ...existing,
        tier,
        totalSpend: newSpend,
        cooldownUntil: newCooldownUntil,
      };

      const updatedTables = {
        ...prev.tables,
        [tableId]: updatedTable,
      };

      // Recalculate table tiers map and re-sort queue
      const tableTiersMap = Object.fromEntries(
        Object.entries(updatedTables).map(([id, t]) => [id, t.tier])
      );

      const updatedQueue = syncQueueWithTableTiers(prev.queue, tableTiersMap);

      return {
        ...prev,
        tables: updatedTables,
        queue: updatedQueue,
      };
    });

    notifyTurnStatus(
      tableId,
      'tier_upgraded',
      '¡Categoría de Mesa Actualizada!',
      `Tu mesa ha sido asignada como ${TIER_CONFIGS[tier].label}. ¡Tus canciones han subido en prioridad!`
    );
  }, [updateStateAndBroadcast, notifyTurnStatus]);

  // Start Song (DJ sets song as now playing)
  const startSong = useCallback((songId: string) => {
    const targetSong = state.queue.find((s) => s.id === songId);
    if (!targetSong) return;

    const remainingQueue = state.queue.filter((s) => s.id !== songId);
    const sortedRemaining = sortQueueByPriority(remainingQueue);

    const playingSong: SongRequest = {
      ...targetSong,
      status: 'playing',
      startedPlayingAt: Date.now(),
      estimatedWaitMinutes: 0,
    };

    updateStateAndBroadcast((prev) => ({
      ...prev,
      currentSong: playingSong,
      queue: sortedRemaining,
    }));

    // 1. Notify the table singing right now
    notifyTurnStatus(
      targetSong.tableId,
      'now_playing',
      '🎤 ¡Es tu turno de cantar!',
      `Tu canción "${targetSong.title}" está en tarima. ¡Acércate al escenario!`
    );

    // 2. Notify the next table in queue (1 song away)
    if (sortedRemaining.length > 0) {
      const nextSong = sortedRemaining[0];
      notifyTurnStatus(
        nextSong.tableId,
        'turn_soon',
        '⚡ ¡Prepárate! Eres el siguiente',
        `Tu canción "${nextSong.title}" suena en aproximadamente ~3-4 minutos.`
      );
    }
    // 3. Notify table 2 in queue (2 songs away)
    if (sortedRemaining.length > 1) {
      const inTwoSongs = sortedRemaining[1];
      notifyTurnStatus(
        inTwoSongs.tableId,
        'turn_soon',
        '🔔 Tu turno está muy cerca',
        `Tu canción "${inTwoSongs.title}" es la #2 en cola. ¡Ten listo tu micrófono!`
      );
    }
  }, [state.queue, updateStateAndBroadcast, notifyTurnStatus]);

  // Complete Current Song & Auto Advance
  const completeCurrentSong = useCallback(() => {
    if (!state.currentSong) return;

    const completed = {
      ...state.currentSong,
      status: 'completed' as const,
      completedAt: Date.now(),
    };

    updateStateAndBroadcast((prev) => {
      const nextQueue = [...prev.queue];
      const nextSong = nextQueue.length > 0 ? nextQueue.shift()! : null;

      let newCurrentSong: SongRequest | null = null;
      if (nextSong) {
        newCurrentSong = {
          ...nextSong,
          status: 'playing',
          startedPlayingAt: Date.now(),
          estimatedWaitMinutes: 0,
        };
      }

      return {
        ...prev,
        history: [completed, ...prev.history],
        currentSong: newCurrentSong,
        queue: sortQueueByPriority(nextQueue),
      };
    });

    soundManager.playVictoryFanfare();
  }, [state.currentSong, updateStateAndBroadcast]);

  // Cancel a Song
  const cancelSong = useCallback((songId: string) => {
    updateStateAndBroadcast((prev) => {
      const cancelled = prev.queue.find((s) => s.id === songId);
      const newQueue = prev.queue.filter((s) => s.id !== songId);

      // Refund quota to table if cancelled
      let newTables = prev.tables;
      if (cancelled && newTables[cancelled.tableId]) {
        const table = newTables[cancelled.tableId];
        newTables = {
          ...newTables,
          [cancelled.tableId]: {
            ...table,
            quotaUsed: Math.max(0, table.quotaUsed - 1),
          },
        };
      }

      return {
        ...prev,
        tables: newTables,
        queue: sortQueueByPriority(newQueue),
      };
    });
  }, [updateStateAndBroadcast]);

  // Reorder queue manually (DJ override)
  const reorderQueueManual = useCallback((newQueue: SongRequest[]) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      queue: newQueue.map((song, idx) => ({
        ...song,
        estimatedWaitMinutes: Math.max(1, Math.round((idx + 1) * 3.5)),
      })),
    }));
  }, [updateStateAndBroadcast]);

  // Spin Roulette & Apply Reward
  const spinRoulette = useCallback((tableId: string): RoulettePrize => {
    const activePrizes = state.prizes.filter((p) => p.active);
    const totalWeight = activePrizes.reduce((sum, p) => sum + p.weight, 0);

    let random = Math.random() * totalWeight;
    let selectedPrize = activePrizes[0];

    for (const prize of activePrizes) {
      if (random < prize.weight) {
        selectedPrize = prize;
        break;
      }
      random -= prize.weight;
    }

    // Apply reward to table
    updateStateAndBroadcast((prev) => {
      const table = prev.tables[tableId];
      if (!table) return prev;

      let updatedTable = { ...table };

      if (selectedPrize.type === 'time_reduction') {
        const reductionMs = selectedPrize.value * 60 * 1000;
        if (updatedTable.cooldownUntil) {
          const newCooldown = Math.max(Date.now(), updatedTable.cooldownUntil - reductionMs);
          updatedTable.cooldownUntil = newCooldown > Date.now() ? newCooldown : null;
        }
      } else if (selectedPrize.type === 'extra_song') {
        updatedTable.extraQuotaBonus = (updatedTable.extraQuotaBonus || 0) + selectedPrize.value;
      }

      if (selectedPrize.type !== 'no_prize') {
        updatedTable.rewardsWon = [
          {
            id: `reward-${Date.now()}`,
            prizeId: selectedPrize.id,
            title: selectedPrize.title,
            description: selectedPrize.description,
            timestamp: Date.now(),
          },
          ...updatedTable.rewardsWon,
        ];
      }

      return {
        ...prev,
        tables: {
          ...prev.tables,
          [tableId]: updatedTable,
        },
      };
    });

    return selectedPrize;
  }, [state.prizes, updateStateAndBroadcast]);

  // Update prizes configuration
  const updatePrizes = useCallback((prizes: RoulettePrize[]) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      prizes,
    }));
  }, [updateStateAndBroadcast]);

  // Add new Table
  const addTable = useCallback((id: string, name: string, tier: ConsumptionTier = 'standard') => {
    const newPin = generateTablePin();
    const newToken = generateSessionToken(id, newPin);

    updateStateAndBroadcast((prev) => ({
      ...prev,
      tables: {
        ...prev.tables,
        [id]: {
          id,
          name,
          tier,
          totalSpend: tier === 'vip_100' ? 100 : tier === 'medium_50' ? 50 : 0,
          quotaUsed: 0,
          extraQuotaBonus: 0,
          cooldownUntil: null,
          lastRequestAt: null,
          pin: newPin,
          sessionToken: newToken,
          sessionCreatedAt: Date.now(),
          isLocked: false,
          rewardsWon: [],
        },
      },
    }));
  }, [updateStateAndBroadcast]);

  const dismissNotification = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const resetAllData = useCallback(() => {
    const fresh: KaraokeState = {
      tables: INITIAL_TABLES,
      queue: sortQueueByPriority(INITIAL_QUEUE),
      currentSong: INITIAL_CURRENT_SONG,
      history: [],
      prizes: INITIAL_PRIZES,
      notifications: [],
      cooldownDefaultMinutes: 15,
      activeView: 'user',
      currentTableId: 'M-04',
      deviceAuthorizations: {
        'M-04': {
          isUnlocked: true,
          isHost: true,
          unlockedAt: Date.now(),
          token: 'tk_m04_auth5b7f',
        },
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    if (channel) {
      channel.postMessage({ type: 'STATE_SYNC', payload: fresh });
    }
    setState(fresh);
  }, [channel]);

  return (
    <KaraokeContext.Provider
      value={{
        state,
        currentTable,
        activeTableId,
        setActiveTableId,
        activeView: state.activeView,
        setActiveView,
        isAdminAuthenticated,
        setIsAdminAuthenticated: (val) => {
          setIsAdminAuthenticated(val);
          sessionStorage.setItem('karaoke_admin_auth', val ? 'true' : 'false');
        },
        showAdminLoginModal,
        setShowAdminLoginModal,
        currentDeviceAuth,
        isTableAuthenticated,
        unlockTableWithPin,
        lockTableSession,
        regenerateTableSession,
        regenerateAllSessions,
        toggleTableLock,
        requestSong,
        setTableTier,
        startSong,
        completeCurrentSong,
        cancelSong,
        reorderQueueManual,
        spinRoulette,
        updatePrizes,
        addTable,
        dismissNotification,
        resetAllData,
      }}
    >
      {children}
    </KaraokeContext.Provider>
  );
};

export const useKaraoke = () => {
  const context = useContext(KaraokeContext);
  if (!context) {
    throw new Error('useKaraoke must be used within a KaraokeProvider');
  }
  return context;
};
