import * as SQLite from 'expo-sqlite/legacy';
import { runMigrations } from './queries';

let database: SQLite.SQLiteDatabase | null = null;

export async function openDatabaseAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }
  const db = SQLite.openDatabase('finsave.db');
  await runMigrations(db);
  database = db;
  return db;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!database) {
    throw new Error('Database has not been initialized');
  }
  return database;
}
