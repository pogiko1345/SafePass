import { Platform } from "react-native";
let AsyncStorage;
if (Platform.OS === "web") {
  AsyncStorage = require("./webStorage").default;
} else {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
}

export const normalizeRfidReaderInput = (value = "") =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^0-9A-F]/g, "");

export const describeRfidReaderInput = (value = "") => {
  const normalized = normalizeRfidReaderInput(value);
  if (!normalized) return "Waiting for card UID";
  return `${normalized.length} hex characters captured`;
};

export const formatRfidHex = (value = "", separator = ":") => {
  const normalized = normalizeRfidReaderInput(value);
  if (!normalized) return "";
  const pairs = [];
  for (let i = 0; i < normalized.length; i += 2) {
    pairs.push(normalized.substr(i, 2));
  }
  return pairs.join(separator);
};

export const isRfidUid = (value = "") => {
  const normalized = normalizeRfidReaderInput(value);
  return [8, 14, 20].includes(normalized.length) || (normalized.length >= 4 && normalized.length <= 32);
};

export const playRfidChime = (type = "success") => {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "success") {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880.0, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.09);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.25);
    } else if (type === "error" || type === "denied") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "connect") {
      const freqs = [440, 554.37, 659.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.11);
      });
    }

    window.setTimeout(() => ctx.close?.(), 600);
  } catch (error) {
    // Audio context may be restricted before gesture
  }
};

export class RfidKeystrokeBuffer {
  constructor(options = {}) {
    this.onScan = options.onScan || (() => {});
    this.onError = options.onError || (() => {});
    this.interKeyTimeout = options.interKeyTimeout || 70;
    this.bufferTimeout = options.bufferTimeout || 350;
    this.minUidLength = options.minUidLength || 4;
    this.active = false;
    this.buffer = "";
    this.lastCharTime = 0;
    this.timer = null;
    this.isAttached = false;
    this.ignoreInputs = options.ignoreInputs !== false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  start() {
    this.active = true;
    if (Platform.OS === "web" && typeof document !== "undefined" && !this.isAttached) {
      document.addEventListener("keydown", this.handleKeyDown, true);
      this.isAttached = true;
    }
  }

  stop() {
    this.active = false;
    if (Platform.OS === "web" && typeof document !== "undefined" && this.isAttached) {
      document.removeEventListener("keydown", this.handleKeyDown, true);
      this.isAttached = false;
    }
    this.clear();
  }

  clear() {
    this.buffer = "";
    this.lastCharTime = 0;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  handleKeyDown(event) {
    if (!this.active) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (this.ignoreInputs && typeof document !== "undefined") {
      const target = event.target || document.activeElement;
      if (
        target &&
        (target.tagName === "TEXTAREA" ||
          (target.tagName === "INPUT" &&
            !["hidden", "submit", "button"].includes(target.type) &&
            !target.dataset?.rfidCapture))
      ) {
        return;
      }
    }

    const now = Date.now();
    const timeSinceLast = now - this.lastCharTime;

    if (event.key === "Enter") {
      if (this.buffer.length >= this.minUidLength) {
        event.preventDefault();
        const captured = normalizeRfidReaderInput(this.buffer);
        this.clear();
        if (captured) {
          playRfidChime("success");
          this.onScan(captured);
        }
      } else {
        this.clear();
      }
      return;
    }

    if (event.key && event.key.length === 1) {
      const char = event.key.toUpperCase();
      if (/[0-9A-F;:?]/.test(char)) {
        this.buffer += char;
        this.lastCharTime = now;

        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          const normalized = normalizeRfidReaderInput(this.buffer);
          if (normalized.length >= this.minUidLength && isRfidUid(normalized)) {
            playRfidChime("success");
            this.onScan(normalized);
          }
          this.clear();
        }, this.bufferTimeout);
      }
    }
  }
}

export class Esp32SerialGateway {
  constructor() {
    this.port = null;
    this.reader = null;
    this.readableStreamClosed = null;
    this.isConnected = false;
    this.listeners = {
      scan: [],
      status: [],
      log: [],
      error: [],
    };
    this.buffer = "";
  }

  static isSupported() {
    return Platform.OS === "web" && typeof navigator !== "undefined" && "serial" in navigator;
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[Esp32SerialGateway] listener error for ${event}:`, err);
        }
      });
    }
  }

  async connect(options = { baudRate: 115200 }) {
    if (!Esp32SerialGateway.isSupported()) {
      throw new Error("Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.");
    }

    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: options.baudRate || 115200 });
      this.isConnected = true;
      this.emit("status", { connected: true, port: this.port.getInfo?.() || {} });
      playRfidChime("connect");
      this.startReading();
      return true;
    } catch (error) {
      this.isConnected = false;
      this.emit("status", { connected: false, error: error?.message });
      this.emit("error", error);
      throw error;
    }
  }

  async startReading() {
    while (this.port && this.port.readable && this.isConnected) {
      try {
        const textDecoder = new window.TextDecoderStream();
        this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
        this.reader = textDecoder.readable.getReader();

        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          if (value) {
            this.handleSerialChunk(value);
          }
        }
      } catch (error) {
        if (this.isConnected) {
          this.emit("log", `Serial stream read error: ${error?.message || error}`);
        }
      } finally {
        if (this.reader) {
          try {
            this.reader.releaseLock();
          } catch (e) {}
        }
      }
    }
  }

  handleSerialChunk(chunk) {
    this.buffer += chunk;
    const lines = this.buffer.split(/[\r\n]+/);
    this.buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      this.emit("log", trimmed);

      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed.nfcCardId || parsed.cardId || parsed.uid) {
            const uid = normalizeRfidReaderInput(parsed.nfcCardId || parsed.cardId || parsed.uid);
            if (uid) {
              playRfidChime("success");
              this.emit("scan", {
                uid,
                raw: parsed,
                source: "esp32_serial",
                checkpointId: parsed.checkpointId || parsed.readerId || "esp32_serial_reader",
              });
              continue;
            }
          }
        } catch (e) {}
      }

      const uidMatch = trimmed.match(/(?:UID|Card|Tag|NFC|ID)[:\s=]+([0-9A-Fa-f\s:-]+)/i) ||
        trimmed.match(/([0-9A-Fa-f]{8,32})/);

      if (uidMatch && uidMatch[1]) {
        const uid = normalizeRfidReaderInput(uidMatch[1]);
        if (isRfidUid(uid)) {
          playRfidChime("success");
          this.emit("scan", {
            uid,
            rawText: trimmed,
            source: "esp32_serial",
            checkpointId: "esp32_serial_reader",
          });
        }
      }
    }
  }

  async disconnect() {
    this.isConnected = false;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (e) {}
    }
    if (this.readableStreamClosed) {
      try {
        await this.readableStreamClosed.catch(() => {});
      } catch (e) {}
    }
    if (this.port) {
      try {
        await this.port.close();
      } catch (e) {}
      this.port = null;
    }
    this.emit("status", { connected: false });
  }
}

const OFFLINE_QUEUE_KEY = "safepass:rfid:offline_queue:v1";
const MAX_OFFLINE_TAPS = 100;
const MAX_OFFLINE_TAP_AGE_MS = 24 * 60 * 60 * 1000;

const isCurrentOfflineTap = (tap) => {
  if (!tap || typeof tap !== "object" || !tap.id || !tap.queuedAt) return false;
  const queuedAt = new Date(tap.queuedAt).getTime();
  return Number.isFinite(queuedAt) && Date.now() - queuedAt <= MAX_OFFLINE_TAP_AGE_MS;
};

export const RfidOfflineQueue = {
  async getPendingTaps() {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const items = Array.isArray(parsed) ? parsed.filter(isCurrentOfflineTap) : [];
      if (stored && items.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(items));
      }
      return items;
    } catch (e) {
      return [];
    }
  },

  async queueTap(tapData) {
    try {
      const items = await this.getPendingTaps();
      const nextItems = [
        ...items,
        {
          ...tapData,
          queuedAt: new Date().toISOString(),
          id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        },
      ].slice(-MAX_OFFLINE_TAPS);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(nextItems));
      return nextItems;
    } catch (e) {
      console.warn("Failed to queue offline tap:", e);
      return [];
    }
  },

  async removeTap(tapId) {
    try {
      const items = await this.getPendingTaps();
      const filtered = items.filter((item) => item.id !== tapId);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
      return filtered;
    } catch (e) {
      return [];
    }
  },

  async clearQueue() {
    try {
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (e) {}
  },
};

