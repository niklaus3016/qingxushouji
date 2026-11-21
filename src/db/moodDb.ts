import { MoodRecord, NewMoodRecord, ReminderSettings, ThemeMode } from '../types/mood';
import { DEFAULT_QUICK_TAGS } from '../constants/moodConfig';

const DB_NAME = 'qingxu_mood_db';
const DB_VERSION = 1;
const STORE_NAME = 'mood_record';

const FALLBACK_STORAGE_KEY = 'qingxu_mood_records_v1';
const THEME_KEY = 'qingxu_theme_mode_v1';
const REMINDER_KEY = 'qingxu_reminder_v1';
const QUICK_TAGS_KEY = 'qingxu_quick_tags_v1';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB unavailable'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('recordDate', 'recordDate', { unique: false });
        store.createIndex('createTimestamp', 'createTimestamp', { unique: false });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // Drop the cached connection if the database is upgraded or closed elsewhere.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });

  return dbPromise;
}

function readFallback(): MoodRecord[] {
  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFallback(records: MoodRecord[]): void {
  try {
    localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore quota errors
  }
}

export async function getAllRecords(): Promise<MoodRecord[]> {
  try {
    const db = await openDB();
    return await new Promise<MoodRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result as MoodRecord[]) || [];
        list.sort((a, b) => b.createTimestamp - a.createTimestamp);
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = readFallback();
    list.sort((a, b) => b.createTimestamp - a.createTimestamp);
    return list;
  }
}

export async function addRecord(record: NewMoodRecord): Promise<MoodRecord> {
  try {
    const db = await openDB();
    return await new Promise<MoodRecord>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(record);
      req.onsuccess = () => {
        const id = req.result as number;
        resolve({ ...record, id });
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = readFallback();
    const nextId = list.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const created: MoodRecord = { ...record, id: nextId };
    list.unshift(created);
    writeFallback(list);
    return created;
  }
}

export async function updateRecord(record: MoodRecord): Promise<MoodRecord> {
  try {
    const db = await openDB();
    return await new Promise<MoodRecord>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = readFallback();
    const next = list.map((item) => (item.id === record.id ? record : item));
    writeFallback(next);
    return record;
  }
}

export async function deleteRecord(id: number): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const list = readFallback();
    writeFallback(list.filter((item) => item.id !== id));
  }
}

export async function clearAllRecords(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    writeFallback([]);
  }
}

export function loadThemeMode(): ThemeMode {
  try {
    const val = localStorage.getItem(THEME_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') return val;
    return 'system';
  } catch {
    return 'system';
  }
}

export function saveThemeMode(mode: ThemeMode): void {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // ignore
  }
}

export function loadReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDER_KEY);
    if (!raw) return { enabled: false, time: '21:00', messageIndex: 0 };
    const parsed = JSON.parse(raw);
    return {
      enabled: Boolean(parsed.enabled),
      time: typeof parsed.time === 'string' ? parsed.time : '21:00',
      messageIndex: parsed.messageIndex === 1 ? 1 : 0,
    };
  } catch {
    return { enabled: false, time: '21:00', messageIndex: 0 };
  }
}

export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadQuickTags(): string[] {
  try {
    const raw = localStorage.getItem(QUICK_TAGS_KEY);
    if (!raw) return DEFAULT_QUICK_TAGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === 'string' && t.trim()) : DEFAULT_QUICK_TAGS;
  } catch {
    return DEFAULT_QUICK_TAGS;
  }
}

export function saveQuickTags(tags: string[]): void {
  try {
    localStorage.setItem(QUICK_TAGS_KEY, JSON.stringify(tags));
  } catch {
    // ignore
  }
}
