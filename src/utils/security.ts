// Security & Anti-Spoofing Utilities for Nightclub Karaoke

export function generateTablePin(): string {
  // Generate random 4-digit PIN between 1000 and 9999
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateSessionToken(tableId: string, pin: string): string {
  const timestamp = Date.now().toString(36);
  const randomSalt = Math.random().toString(36).substring(2, 8);
  const raw = `${tableId}_${pin}_${timestamp}_${randomSalt}`;
  
  // Simple deterministic client hash for token signing
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `tk_${hexHash}_${randomSalt}`;
}

export function getOrCreateDeviceId(): string {
  const STORAGE_KEY = 'karaoke_device_fingerprint_v1';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
}

export function signTableUrl(baseUrl: string, tableId: string, token: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set('mesa', tableId);
  url.searchParams.set('auth', token);
  return url.toString();
}
