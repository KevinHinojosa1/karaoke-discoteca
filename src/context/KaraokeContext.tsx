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
import { generateSessionToken, generateTablePin, getOrCreateDeviceId } from '../utils/security';
import { cloudSync } from '../utils/cloudSync';

const MAX_DEVICES_PER_TABLE = 3;

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
  currentDeviceAuth: TableDeviceAuth | undefined;
  isTableAuthenticated: boolean;
  unlockTableWithPin: (tableId: string, pin: string, isHost?: boolean) => { success: boolean; error?: string };
  disconnectCurrentDevice: (tableId: string) => void;
  lockTableSession: (tableId: string) => void;
  regenerateTableSession: (tableId: string) => { newPin: string; newToken: string };
  regenerateAllSessions: () => void;
  toggleTableLock: (tableId: string) => void;
  requestSong: (tableId: string, title: string, artist: string, notes?: string) => { success: boolean; error?: string; song?: SongRequest; eligibleForRoulette?: boolean };
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

const STORAGE_KEY = 'karaoke_discoteca_state_v6';
const BROADCAST_NAME = 'karaoke_realtime_broadcast';

const KaraokeContext = createContext<KaraokeContextType | null>(null);

export const KaraokeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Device unique identifier
  const deviceId = useMemo(() => getOrCreateDeviceId(), []);

  // Parse URL parameters for initial table and token auth
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialTableParam = urlParams.get('mesa') || 'M-04';
  const initialAuthToken = urlParams.get('auth');

  const [state, setState] = useState<KaraokeState>(() => {
    // Empty initial auths - strictly requires PIN
    const initialAuths: Record<string, TableDeviceAuth> = {};

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

  // Broadcast channel for tabs on the SAME device
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  // Save to localStorage, Local BroadcastChannel and Cloud WebSocket Relay
  const updateStateAndBroadcast = useCallback((updater: (prev: KaraokeState) => KaraokeState) => {
    setState((prev) => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        if (channel) {
          channel.postMessage({ type: 'STATE_SYNC', payload: next });
        }
        cloudSync.broadcastState(next, deviceId);
      } catch (err) {
        console.error('Error broadcasting state:', err);
      }
      return next;
    });
  }, [channel, deviceId]);

  // Local BroadcastChannel Listener
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
            deviceAuthorizations: prev.deviceAuthorizations,
          }));
        }
      };

      return () => {
        bc.close();
      };
    }
  }, []);

  // Global Realtime Cloud Sync across different physical devices (PC + Phones)
  useEffect(() => {
    cloudSync.init((msg) => {
      if (msg.senderDeviceId === deviceId) return;

      if (msg.type === 'STATE_UPDATE' && msg.payload) {
        setState((prev) => {
          const incoming = msg.payload as KaraokeState;
          if (!incoming || !incoming.tables) return prev;

          // Merge incoming global tables (including authorizedDevices list) and global queue
          return {
            ...prev,
            tables: incoming.tables,
            queue: incoming.queue,
            currentSong: incoming.currentSong,
            history: incoming.history,
            prizes: incoming.prizes || prev.prizes,
            notifications: incoming.notifications || prev.notifications,
            // Keep local view and local table selection unless requested
          };
        });
      } else if (msg.type === 'REQUEST_SYNC') {
        setState((current) => {
          // If we have state, broadcast back
          cloudSync.broadcastState(current, deviceId);
          return current;
        });
      }
    });

    return () => {
      cloudSync.disconnect();
    };
  }, [deviceId]);

  // Check URL Token Authentication on Mount with max 3 devices check
  useEffect(() => {
    if (initialAuthToken && state.tables[initialTableParam]) {
      const targetTable = state.tables[initialTableParam];

      if (targetTable.sessionToken === initialAuthToken && !targetTable.isLocked) {
        const authorizedList = targetTable.authorizedDevices || [];
        const isAlreadyAuth = authorizedList.includes(deviceId);

        if (isAlreadyAuth || authorizedList.length < MAX_DEVICES_PER_TABLE) {
          const updatedDevices = isAlreadyAuth ? authorizedList : [...authorizedList, deviceId];

          updateStateAndBroadcast((prev) => {
            const table = prev.tables[initialTableParam];
            if (!table) return prev;

            const updatedTable = { ...table, authorizedDevices: updatedDevices };
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
              tables: { ...prev.tables, [initialTableParam]: updatedTable },
              deviceAuthorizations: updatedAuths,
            };
          });
        }
      }
    }
  }, [initialAuthToken, initialTableParam, deviceId, updateStateAndBroadcast]);

  const activeTableId = state.currentTableId;
  const currentTable = state.tables[activeTableId];

  // Device Authentication State for current table (requires token match & active device auth)
  const currentDeviceAuth = state.deviceAuthorizations?.[activeTableId];
  const isTableAuthenticated = Boolean(
    currentDeviceAuth?.isUnlocked &&
    currentTable &&
    !currentTable.isLocked &&
    currentDeviceAuth.token === currentTable.sessionToken &&
    (currentTable.authorizedDevices || []).includes(deviceId)
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

  // Unlock Table with 4-digit PIN (With Max 3 Devices Enforcement)
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

    const currentDevices = table.authorizedDevices || [];
    const isAlreadyConnected = currentDevices.includes(deviceId);

    // Enforce Max 3 Devices per table
    if (!isAlreadyConnected && currentDevices.length >= MAX_DEVICES_PER_TABLE) {
      soundManager.playTap();
      return {
        success: false,
        error: `⚠️ Límite alcanzado: Máximo ${MAX_DEVICES_PER_TABLE} celulares pueden estar conectados a esta mesa a la vez. Pide a un acompañante desconectarse o solicita al DJ reiniciar la sesión.`,
      };
    }

    const updatedDevices = isAlreadyConnected ? currentDevices : [...currentDevices, deviceId];

    // Success! Authorize device
    soundManager.playVictoryFanfare();

    updateStateAndBroadcast((prev) => {
      const target = prev.tables[tableId];
      if (!target) return prev;

      const updatedTable = {
        ...target,
        authorizedDevices: updatedDevices,
      };

      const newAuths = {
        ...prev.deviceAuthorizations,
        [tableId]: {
          isUnlocked: true,
          isHost,
          unlockedAt: Date.now(),
          token: target.sessionToken,
        },
      };

      return {
        ...prev,
        tables: { ...prev.tables, [tableId]: updatedTable },
        deviceAuthorizations: newAuths,
      };
    });

    return { success: true };
  }, [state.tables, deviceId, updateStateAndBroadcast]);

  // Disconnect Current Device from table
  const disconnectCurrentDevice = useCallback((tableId: string) => {
    updateStateAndBroadcast((prev) => {
      const table = prev.tables[tableId];
      const newAuths = { ...prev.deviceAuthorizations };
      delete newAuths[tableId];

      if (!table) return { ...prev, deviceAuthorizations: newAuths };

      const updatedDevices = (table.authorizedDevices || []).filter((d) => d !== deviceId);
      const updatedTable = { ...table, authorizedDevices: updatedDevices };

      return {
        ...prev,
        tables: { ...prev.tables, [tableId]: updatedTable },
        deviceAuthorizations: newAuths,
      };
    });
  }, [deviceId, updateStateAndBroadcast]);

  // Lock or Reset specific Table session (DJ Action)
  const lockTableSession = useCallback((tableId: string) => {
    updateStateAndBroadcast((prev) => {
      const updatedAuths = { ...prev.deviceAuthorizations };
      delete updatedAuths[tableId];
      return {
        ...prev,
        deviceAuthorizations: updatedAuths,
      };
    });
  }, [updateStateAndBroadcast]);

  // Regenerate Table PIN & Clear all connected devices (DJ Action)
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
        authorizedDevices: [], // Wipes all connected phones!
      };

      const updatedAuths = { ...prev.deviceAuthorizations };
      delete updatedAuths[tableId];

      return {
        ...prev,
        tables: { ...prev.tables, [tableId]: updatedTable },
        deviceAuthorizations: updatedAuths,
      };
    });

    return { newPin, newToken };
  }, [updateStateAndBroadcast]);

  // Rotate ALL Tables for New Night (DJ Action)
  const regenerateAllSessions = useCallback(() => {
    updateStateAndBroadcast((prev) => {
      const newTables: Record<string, Table> = {};

      Object.entries(prev.tables).forEach(([id, table]) => {
        const pin = generateTablePin();
        const token = generateSessionToken(id, pin);
        newTables[id] = {
          ...table,
          pin,
          sessionToken: token,
          sessionCreatedAt: Date.now(),
          isLocked: false,
          authorizedDevices: [],
        };
      });

      return {
        ...prev,
        tables: newTables,
        deviceAuthorizations: {},
      };
    });
  }, [updateStateAndBroadcast]);

  // Toggle Table Lock (DJ Action)
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

  // Trigger Local + Web Push Notification
  const triggerNotification = useCallback((
    tableId: string,
    type: AppNotification['type'],
    title: string,
    message: string
  ) => {
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

  // Request a Song from a Table
  const requestSong = useCallback((
    tableId: string,
    title: string,
    artist: string,
    notes?: string
  ): { success: boolean; error?: string; song?: SongRequest; eligibleForRoulette?: boolean } => {
    const table = state.tables[tableId];
    if (!table) {
      return { success: false, error: 'Mesa no encontrada' };
    }

    if (table.isLocked) {
      return { success: false, error: 'Esta mesa se encuentra bloqueada por el DJ.' };
    }

    const tierConfig = TIER_CONFIGS[table.tier];
    const maxAllowed = tierConfig.maxSongs + table.extraQuotaBonus;

    if (table.quotaUsed >= maxAllowed) {
      return {
        success: false,
        error: `Has alcanzado el límite máximo de ${maxAllowed} canciones para tu categoría. Consulta con un mesero para aumentar tu consumo.`,
      };
    }

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

    const cooldownDuration =
      table.tier === 'standard'
        ? (table.customCooldownMinutes || state.cooldownDefaultMinutes) * 60 * 1000
        : 0;

    const newCooldownUntil = cooldownDuration > 0 ? Date.now() + cooldownDuration : null;

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
    const isStandard = table.tier === 'standard';

    return {
      success: true,
      song: newSong,
      eligibleForRoulette: isStandard,
    };
  }, [state.tables, state.cooldownDefaultMinutes, updateStateAndBroadcast]);

  // Set Table Tier / Spend (DJ action)
  const setTableTier = useCallback((
    tableId: string,
    tier: ConsumptionTier,
    totalSpend?: number
  ) => {
    updateStateAndBroadcast((prev) => {
      const table = prev.tables[tableId];
      if (!table) return prev;

      const newSpend =
        totalSpend !== undefined
          ? totalSpend
          : tier === 'vip_100'
          ? Math.max(100, table.totalSpend)
          : tier === 'medium_50'
          ? Math.max(50, table.totalSpend)
          : table.totalSpend;

      const newCooldown = tier === 'vip_100' || tier === 'medium_50' ? null : table.cooldownUntil;

      const updatedTable: Table = {
        ...table,
        tier,
        totalSpend: newSpend,
        cooldownUntil: newCooldown,
      };

      const updatedTables = {
        ...prev.tables,
        [tableId]: updatedTable,
      };

      const tableTiersMap = Object.fromEntries(
        Object.entries(updatedTables).map(([id, t]) => [id, t.tier])
      );

      const recomputedQueue = syncQueueWithTableTiers(prev.queue, tableTiersMap);

      return {
        ...prev,
        tables: updatedTables,
        queue: recomputedQueue,
      };
    });

    triggerNotification(
      tableId,
      'tier_upgraded',
      '¡Categoría de Mesa Actualizada!',
      `Tu mesa ha sido asignada como ${TIER_CONFIGS[tier].label}. ¡Tus canciones han subido en prioridad!`
    );
  }, [updateStateAndBroadcast, triggerNotification]);

  // DJ Plays Next / Starts a Song
  const startSong = useCallback((songId: string) => {
    const song = state.queue.find((s) => s.id === songId);
    if (!song) return;

    const remainingQueue = state.queue.filter((s) => s.id !== songId);
    const reorderedQueue = sortQueueByPriority(remainingQueue);

    const nowPlaying: SongRequest = {
      ...song,
      status: 'playing',
      startedPlayingAt: Date.now(),
      estimatedWaitMinutes: 0,
    };

    updateStateAndBroadcast((prev) => ({
      ...prev,
      currentSong: nowPlaying,
      queue: reorderedQueue,
    }));

    triggerNotification(
      song.tableId,
      'now_playing',
      '🎤 ¡Es tu turno de cantar!',
      `Tu canción "${song.title}" está en tarima. ¡Acércate al escenario!`
    );

    if (reorderedQueue.length > 0) {
      const next1 = reorderedQueue[0];
      triggerNotification(
        next1.tableId,
        'turn_soon',
        '⚡ ¡Prepárate! Eres el siguiente',
        `Tu canción "${next1.title}" suena en aproximadamente ~3-4 minutos.`
      );
    }

    if (reorderedQueue.length > 1) {
      const next2 = reorderedQueue[1];
      triggerNotification(
        next2.tableId,
        'turn_soon',
        '🔔 Tu turno está muy cerca',
        `Tu canción "${next2.title}" es la #2 en cola. ¡Ten listo tu micrófono!`
      );
    }
  }, [state.queue, updateStateAndBroadcast, triggerNotification]);

  // DJ Completes Current Song
  const completeCurrentSong = useCallback(() => {
    if (!state.currentSong) return;

    const finishedSong: SongRequest = {
      ...state.currentSong,
      status: 'completed',
      completedAt: Date.now(),
    };

    updateStateAndBroadcast((prev) => {
      const nextQueue = [...prev.queue];
      const autoNext = nextQueue.length > 0 ? nextQueue.shift()! : null;

      let nextPlaying: SongRequest | null = null;
      if (autoNext) {
        nextPlaying = {
          ...autoNext,
          status: 'playing',
          startedPlayingAt: Date.now(),
          estimatedWaitMinutes: 0,
        };
      }

      return {
        ...prev,
        history: [finishedSong, ...prev.history],
        currentSong: nextPlaying,
        queue: sortQueueByPriority(nextQueue),
      };
    });

    soundManager.playVictoryFanfare();
  }, [state.currentSong, updateStateAndBroadcast]);

  // Cancel / Delete a song from Queue
  const cancelSong = useCallback((songId: string) => {
    updateStateAndBroadcast((prev) => {
      const target = prev.queue.find((s) => s.id === songId);
      const nextQueue = prev.queue.filter((s) => s.id !== songId);

      let updatedTables = prev.tables;
      if (target && updatedTables[target.tableId]) {
        const table = updatedTables[target.tableId];
        updatedTables = {
          ...updatedTables,
          [target.tableId]: {
            ...table,
            quotaUsed: Math.max(0, table.quotaUsed - 1),
          },
        };
      }

      return {
        ...prev,
        tables: updatedTables,
        queue: sortQueueByPriority(nextQueue),
      };
    });
  }, [updateStateAndBroadcast]);

  // DJ Manual Queue Reorder
  const reorderQueueManual = useCallback((newQueue: SongRequest[]) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      queue: newQueue.map((s, idx) => ({
        ...s,
        estimatedWaitMinutes: Math.max(1, Math.round((idx + 1) * 3.5)),
      })),
    }));
  }, [updateStateAndBroadcast]);

  // Spin Rewards Roulette
  const spinRoulette = useCallback((tableId: string): RoulettePrize => {
    const activePrizes = state.prizes.filter((p) => p.active);
    const totalWeight = activePrizes.reduce((sum, p) => sum + p.weight, 0);

    let randomVal = Math.random() * totalWeight;
    let selectedPrize = activePrizes[0];

    for (const prize of activePrizes) {
      if (randomVal < prize.weight) {
        selectedPrize = prize;
        break;
      }
      randomVal -= prize.weight;
    }

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

  // Update Roulette Prizes Configuration
  const updatePrizes = useCallback((prizes: RoulettePrize[]) => {
    updateStateAndBroadcast((prev) => ({
      ...prev,
      prizes,
    }));
  }, [updateStateAndBroadcast]);

  // Add a new Table
  const addTable = useCallback((id: string, name: string, tier: ConsumptionTier = 'standard') => {
    const pin = generateTablePin();
    const token = generateSessionToken(id, pin);

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
          pin,
          sessionToken: token,
          sessionCreatedAt: Date.now(),
          isLocked: false,
          authorizedDevices: [],
          rewardsWon: [],
        },
      },
    }));
  }, [updateStateAndBroadcast]);

  // Dismiss Notification
  const dismissNotification = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  // Reset All Club Data
  const resetAllData = useCallback(() => {
    const freshState: KaraokeState = {
      tables: INITIAL_TABLES,
      queue: sortQueueByPriority(INITIAL_QUEUE),
      currentSong: INITIAL_CURRENT_SONG,
      history: [],
      prizes: INITIAL_PRIZES,
      notifications: [],
      cooldownDefaultMinutes: 15,
      activeView: 'user',
      currentTableId: 'M-04',
      deviceAuthorizations: {},
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
    if (channel) {
      channel.postMessage({ type: 'STATE_SYNC', payload: freshState });
    }
    cloudSync.broadcastState(freshState, deviceId);
    setState(freshState);
  }, [channel, deviceId]);

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
        setIsAdminAuthenticated: (auth: boolean) => {
          setIsAdminAuthenticated(auth);
          sessionStorage.setItem('karaoke_admin_auth', auth ? 'true' : 'false');
        },
        showAdminLoginModal,
        setShowAdminLoginModal,
        currentDeviceAuth,
        isTableAuthenticated,
        unlockTableWithPin,
        disconnectCurrentDevice,
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

export const useKaraoke = (): KaraokeContextType => {
  const context = useContext(KaraokeContext);
  if (!context) {
    throw new Error('useKaraoke must be used within a KaraokeProvider');
  }
  return context;
};
