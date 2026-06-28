import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "photobooth.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id          TEXT PRIMARY KEY,
      filename    TEXT,
      drive_file_id TEXT,
      drive_web_url TEXT,
      email       TEXT,
      guest_name  TEXT,
      downloaded  INTEGER NOT NULL DEFAULT 0,
      email_sent  INTEGER NOT NULL DEFAULT 0,
      created_at  INTEGER NOT NULL,
      completed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS drive_upload_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id  TEXT NOT NULL,
      attempt     INTEGER NOT NULL DEFAULT 1,
      success     INTEGER NOT NULL DEFAULT 0,
      error       TEXT,
      uploaded_at INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );
  `);

  return _db;
}

export interface SessionRecord {
  id: string;
  filename: string | null;
  drive_file_id: string | null;
  drive_web_url: string | null;
  email: string | null;
  guest_name: string | null;
  downloaded: number;
  email_sent: number;
  created_at: number;
  completed_at: number | null;
}

export function upsertSession(data: {
  id: string;
  filename?: string | null;
  driveFileId?: string | null;
  driveWebUrl?: string | null;
  email?: string | null;
  guestName?: string | null;
  downloaded?: boolean;
  emailSent?: boolean;
  completedAt?: number | null;
}) {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .get(data.id) as SessionRecord | undefined;

  if (!existing) {
    db.prepare(`
      INSERT INTO sessions (id, filename, drive_file_id, drive_web_url, email, guest_name, downloaded, email_sent, created_at, completed_at)
      VALUES (@id, @filename, @driveFileId, @driveWebUrl, @email, @guestName, @downloaded, @emailSent, @createdAt, @completedAt)
    `).run({
      id: data.id,
      filename: data.filename ?? null,
      driveFileId: data.driveFileId ?? null,
      driveWebUrl: data.driveWebUrl ?? null,
      email: data.email ?? null,
      guestName: data.guestName ?? null,
      downloaded: data.downloaded ? 1 : 0,
      emailSent: data.emailSent ? 1 : 0,
      createdAt: Date.now(),
      completedAt: data.completedAt ?? null,
    });
  } else {
    db.prepare(`
      UPDATE sessions SET
        filename    = COALESCE(@filename, filename),
        drive_file_id = COALESCE(@driveFileId, drive_file_id),
        drive_web_url = COALESCE(@driveWebUrl, drive_web_url),
        email       = COALESCE(@email, email),
        guest_name  = COALESCE(@guestName, guest_name),
        downloaded  = CASE WHEN @downloaded = 1 THEN 1 ELSE downloaded END,
        email_sent  = CASE WHEN @emailSent = 1 THEN 1 ELSE email_sent END,
        completed_at = COALESCE(@completedAt, completed_at)
      WHERE id = @id
    `).run({
      id: data.id,
      filename: data.filename ?? null,
      driveFileId: data.driveFileId ?? null,
      driveWebUrl: data.driveWebUrl ?? null,
      email: data.email ?? null,
      guestName: data.guestName ?? null,
      downloaded: data.downloaded ? 1 : 0,
      emailSent: data.emailSent ? 1 : 0,
      completedAt: data.completedAt ?? null,
    });
  }
}

export function logDriveUpload(
  sessionId: string,
  attempt: number,
  success: boolean,
  error?: string
) {
  const db = getDb();
  db.prepare(`
    INSERT INTO drive_upload_log (session_id, attempt, success, error, uploaded_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(sessionId, attempt, success ? 1 : 0, error ?? null, Date.now());
}

export function getAllSessions(limit = 100, offset = 0): SessionRecord[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM sessions ORDER BY created_at DESC LIMIT ? OFFSET ?")
    .all(limit, offset) as SessionRecord[];
}

export function getStats() {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) as c FROM sessions").get() as { c: number }).c;
  const downloads = (
    db.prepare("SELECT COUNT(*) as c FROM sessions WHERE downloaded = 1").get() as { c: number }
  ).c;
  const emails = (
    db.prepare("SELECT COUNT(*) as c FROM sessions WHERE email_sent = 1").get() as { c: number }
  ).c;
  const driveUploaded = (
    db.prepare("SELECT COUNT(*) as c FROM sessions WHERE drive_file_id IS NOT NULL").get() as {
      c: number;
    }
  ).c;

  const hourRow = db
    .prepare(`
      SELECT strftime('%H', datetime(created_at/1000, 'unixepoch', 'localtime')) as hr,
             COUNT(*) as cnt
      FROM sessions
      GROUP BY hr
      ORDER BY cnt DESC
      LIMIT 1
    `)
    .get() as { hr: string; cnt: number } | undefined;

  return { total, downloads, emails, driveUploaded, peakHour: hourRow?.hr ?? null };
}
