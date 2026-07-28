import fs from "fs/promises";
import path from "path";
import os from "os";

const SESSION_DIR = path.join(os.homedir(), ".terminal-ai", "sessions");

async function ensureDir() {
  await fs.mkdir(SESSION_DIR, { recursive: true });
}

export function sessionPath(name: string): string {
  return path.join(SESSION_DIR, `${name}.json`);
}

export async function sessionExists(name: string): Promise<boolean> {
  try {
    await fs.access(sessionPath(name));
    return true;
  } catch {
    return false;
  }
}

export interface SessionMeta {
  name: string;
  threadId: string;
  createdAt: string;
  lastUsedAt: string;
}

export async function saveSessionMeta(meta: SessionMeta): Promise<void> {
  await ensureDir();
  await fs.writeFile(sessionPath(meta.name), JSON.stringify(meta, null, 2), "utf-8");
}

export async function loadSessionMeta(name: string): Promise<SessionMeta | null> {
  try {
    const raw = await fs.readFile(sessionPath(name), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function listSessions(): Promise<string[]> {
  await ensureDir();
  const files = await fs.readdir(SESSION_DIR);
  return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
}