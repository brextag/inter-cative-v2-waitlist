import fs from "fs";
import path from "path";

// On Vercel the app filesystem is read-only; /tmp is writable (per-instance).
const DATA_DIR =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? path.join("/tmp", "inter-cative-waitlist")
    : path.join(process.cwd(), "data");

const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

export type WaitlistEntry = {
  id: string;
  email: string;
  createdAt: string;
  notified?: boolean;
};

export type Settings = {
  dropDate: string | null;
  productName: string;
  launchMessage: string;
  lastNotifiedAt: string | null;
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson<T>(file: string, fallback: T): T {
  try {
    ensureDataDir();
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, "utf-8");
      return JSON.parse(raw) as T;
    }
  } catch (e) {
    console.error("readJson error:", e);
  }
  return fallback;
}

function writeJson<T>(file: string, data: T) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

export function getWaitlist(): WaitlistEntry[] {
  return readJson<WaitlistEntry[]>(WAITLIST_FILE, []);
}

export function addToWaitlist(
  email: string
): { success: boolean; message: string; entry?: WaitlistEntry } {
  try {
    const list = getWaitlist();
    const normalized = email.trim().toLowerCase();
    if (list.some((e) => e.email === normalized)) {
      return { success: false, message: "You're already on the waitlist!" };
    }
    const entry: WaitlistEntry = {
      id: crypto.randomUUID(),
      email: normalized,
      createdAt: new Date().toISOString(),
      notified: false,
    };
    list.push(entry);
    writeJson(WAITLIST_FILE, list);
    return {
      success: true,
      message: "You're on the list! We'll email you when v2 drops.",
      entry,
    };
  } catch (e) {
    console.error("addToWaitlist error:", e);
    return {
      success: false,
      message: "Could not save your email. Please try again in a moment.",
    };
  }
}

export function getSettings(): Settings {
  return readJson<Settings>(SETTINGS_FILE, {
    dropDate: null,
    productName: "inter-cative v2",
    launchMessage: "inter-cative v2 is live! Private Local AI, better than ever.",
    lastNotifiedAt: null,
  });
}

export function updateSettings(partial: Partial<Settings>): Settings {
  const current = getSettings();
  const next = { ...current, ...partial };
  writeJson(SETTINGS_FILE, next);
  return next;
}

export function markNotified(ids: string[]) {
  const list = getWaitlist();
  const set = new Set(ids);
  const updated = list.map((e) =>
    set.has(e.id) ? { ...e, notified: true } : e
  );
  writeJson(WAITLIST_FILE, updated);
}
