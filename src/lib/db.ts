import fs from "fs";
import path from "path";

const DATA_DIR = process.env.NODE_ENV === "production"
  ? "/tmp/cf_data"
  : path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, defaultVal: T): T {
  ensureDir();
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return defaultVal;
  return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
}

function writeJson<T>(file: string, data: T): void {
  ensureDir();
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// ---- Types ----
export type Role = "owner" | "trainer" | "member";

export interface User {
  id: string;
  phone: string;
  password: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Member {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  trainerId?: string;
  subscriptionId?: string;
  emergencyContact?: string;
  photoUrl?: string;
}

export interface Trainer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  specialization: string;
  status: "active" | "inactive";
  joinDate: string;
  memberCount: number;
}

export interface Subscription {
  id: string;
  memberId: string;
  plan: "monthly" | "quarterly" | "annual";
  amount: number;
  status: "active" | "expired" | "pending";
  startDate: string;
  endDate: string;
  paidDate?: string;
  notes?: string;
}

export interface ProgressEntry {
  id: string;
  memberId: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  benchPress?: number;
  squat?: number;
  deadlift?: number;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  read: boolean;
  createdAt: string;
}

// ---- Data access ----
export const db = {
  users: {
    getAll: () => readJson<User[]>("users.json", []),
    save: (users: User[]) => writeJson("users.json", users),
    find: (phone: string) => readJson<User[]>("users.json", []).find((u) => u.phone === phone),
    findById: (id: string) => readJson<User[]>("users.json", []).find((u) => u.id === id),
  },
  members: {
    getAll: () => readJson<Member[]>("members.json", []),
    save: (members: Member[]) => writeJson("members.json", members),
    findById: (id: string) => readJson<Member[]>("members.json", []).find((m) => m.id === id),
  },
  trainers: {
    getAll: () => readJson<Trainer[]>("trainers.json", []),
    save: (trainers: Trainer[]) => writeJson("trainers.json", trainers),
    findById: (id: string) => readJson<Trainer[]>("trainers.json", []).find((t) => t.id === id),
  },
  subscriptions: {
    getAll: () => readJson<Subscription[]>("subscriptions.json", []),
    save: (subs: Subscription[]) => writeJson("subscriptions.json", subs),
  },
  progress: {
    getAll: () => readJson<ProgressEntry[]>("progress.json", []),
    save: (entries: ProgressEntry[]) => writeJson("progress.json", entries),
  },
  notifications: {
    getAll: () => readJson<Notification[]>("notifications.json", []),
    save: (n: Notification[]) => writeJson("notifications.json", n),
  },
};
