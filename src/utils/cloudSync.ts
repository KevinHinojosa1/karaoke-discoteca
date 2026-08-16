import mqtt, { MqttClient } from 'mqtt';
import { KaraokeState } from '../types';

const SYNC_TOPIC = 'karaoke_hinojosa_live_v1/sync';

// List of public high-availability secure WebSocket MQTT brokers
const BROKER_URLS = [
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://broker.emqx.io:8084/mqtt',
];

export interface SyncMessage {
  type: 'STATE_UPDATE' | 'DEVICE_CONNECTED' | 'DEVICE_DISCONNECTED' | 'REQUEST_SYNC' | 'SONG_EVENT';
  senderDeviceId: string;
  timestamp: number;
  payload?: any;
}

class CloudSyncManager {
  private client: MqttClient | null = null;
  private isConnected = false;
  private currentBrokerIndex = 0;
  private onMessageCallback: ((msg: SyncMessage) => void) | null = null;

  public init(onMessage: (msg: SyncMessage) => void) {
    this.onMessageCallback = onMessage;
    this.connect();
  }

  private connect() {
    const brokerUrl = BROKER_URLS[this.currentBrokerIndex];
    const clientId = `karaoke_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    try {
      this.client = mqtt.connect(brokerUrl, {
        clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 3000,
        keepalive: 30,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.client?.subscribe(SYNC_TOPIC, { qos: 1 }, (err) => {
          if (!err) {
            // Request fresh state from any active DJ or peer
            this.broadcast({
              type: 'REQUEST_SYNC',
              senderDeviceId: clientId,
              timestamp: Date.now(),
            });
          }
        });
      });

      this.client.on('message', (_topic, message) => {
        try {
          const parsed: SyncMessage = JSON.parse(message.toString());
          if (parsed && this.onMessageCallback) {
            this.onMessageCallback(parsed);
          }
        } catch (e) {
          // ignore malformed
        }
      });

      this.client.on('error', () => {
        this.tryNextBroker();
      });

      this.client.on('offline', () => {
        this.isConnected = false;
      });
    } catch {
      this.tryNextBroker();
    }
  }

  private tryNextBroker() {
    if (this.client) {
      try {
        this.client.end(true);
      } catch {}
    }
    this.currentBrokerIndex = (this.currentBrokerIndex + 1) % BROKER_URLS.length;
    setTimeout(() => this.connect(), 2000);
  }

  public broadcast(msg: SyncMessage) {
    if (this.client && this.isConnected) {
      try {
        this.client.publish(SYNC_TOPIC, JSON.stringify(msg), { qos: 1 });
      } catch (err) {
        console.error('Error publishing cloud sync message:', err);
      }
    }
  }

  public broadcastState(state: KaraokeState, senderDeviceId: string) {
    this.broadcast({
      type: 'STATE_UPDATE',
      senderDeviceId,
      timestamp: Date.now(),
      payload: state,
    });
  }

  public disconnect() {
    if (this.client) {
      try {
        this.client.end(true);
      } catch {}
      this.client = null;
      this.isConnected = false;
    }
  }
}

export const cloudSync = new CloudSyncManager();
