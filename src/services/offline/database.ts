import type { SQLiteDatabase } from "expo-sqlite";
import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "e_timesheet.db";

let databasePromise: Promise<SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = openDatabase();
  }

  return databasePromise;
}

async function openDatabase(): Promise<SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  await initializeDatabase(db);

  return db;
}

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS master_data_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data_type TEXT NOT NULL UNIQUE,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS timesheet_drafts (
      local_id TEXT PRIMARY KEY NOT NULL,
      server_id INTEGER,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_timesheet_drafts_status
      ON timesheet_drafts(status);

    CREATE INDEX IF NOT EXISTS idx_timesheet_drafts_created_at
      ON timesheet_drafts(created_at);
  `);
}
