import * as SQLite from 'expo-sqlite/legacy';
import type { ResultSet, ResultSetError } from 'expo-sqlite/legacy';
import type { Goal, GoalInput, Transaction, TransactionInput } from '../types';

type LegacyDatabase = SQLite.SQLiteDatabase;

function isResultSetError(r: ResultSet | ResultSetError): r is ResultSetError {
  return 'error' in r && r.error !== undefined;
}

function unwrapExecResult(results: (ResultSet | ResultSetError)[]): ResultSet {
  const first = results[0];
  if (!first) {
    throw new Error('SQLite returned no result');
  }
  if (isResultSetError(first)) {
    throw first.error;
  }
  return first;
}

async function execRead(db: LegacyDatabase, sql: string, args: unknown[] = []): Promise<ResultSet> {
  return unwrapExecResult(await db.execAsync([{ sql, args }], true));
}

async function execWrite(db: LegacyDatabase, sql: string, args: unknown[] = []): Promise<ResultSet> {
  return unwrapExecResult(await db.execAsync([{ sql, args }], false));
}

const DDL_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS transactions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  amount      REAL    NOT NULL CHECK(amount > 0),
  type        TEXT    NOT NULL CHECK(type IN ('income', 'expense')),
  category    TEXT    NOT NULL,
  date        TEXT    NOT NULL,
  notes       TEXT    NOT NULL DEFAULT '',
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
)`,
  `CREATE TABLE IF NOT EXISTS goals (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  target      REAL    NOT NULL CHECK(target > 0),
  month       TEXT    NOT NULL,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)`,
];

export async function runMigrations(db: LegacyDatabase): Promise<void> {
  const queries = DDL_STATEMENTS.map((sql) => ({ sql, args: [] as unknown[] }));
  const results = await db.execAsync(queries, false);
  for (const r of results) {
    if (isResultSetError(r)) {
      throw r.error;
    }
  }
}

interface TransactionRow {
  id: number;
  amount: number;
  type: string;
  category: string;
  date: string;
  notes: string;
  created_at: string;
}

interface GoalRow {
  id: number;
  title: string;
  target: number;
  month: string;
  created_at: string;
}

function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    type: row.type === 'income' ? 'income' : 'expense',
    category: row.category,
    date: row.date,
    notes: row.notes,
    created_at: row.created_at,
  };
}

function mapGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    title: row.title,
    target: row.target,
    month: row.month,
    created_at: row.created_at,
  };
}

export async function getAllTransactions(db: LegacyDatabase): Promise<Transaction[]> {
  const rs = await execRead(
    db,
    `SELECT id, amount, type, category, date, notes, created_at FROM transactions ORDER BY date DESC, id DESC`,
  );
  return rs.rows.map((row) => mapTransaction(row as TransactionRow));
}

export async function getTransactionById(
  db: LegacyDatabase,
  id: number,
): Promise<Transaction | null> {
  const rs = await execRead(
    db,
    `SELECT id, amount, type, category, date, notes, created_at FROM transactions WHERE id = ?`,
    [id],
  );
  const row = rs.rows[0] as TransactionRow | undefined;
  return row ? mapTransaction(row) : null;
}

export async function insertTransaction(
  db: LegacyDatabase,
  input: TransactionInput,
): Promise<number> {
  const rs = await execWrite(
    db,
    `INSERT INTO transactions (amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?)`,
    [input.amount, input.type, input.category, input.date, input.notes],
  );
  return Number(rs.insertId ?? 0);
}

export async function updateTransaction(
  db: LegacyDatabase,
  id: number,
  input: Partial<TransactionInput>,
): Promise<void> {
  const existing = await getTransactionById(db, id);
  if (!existing) {
    throw new Error('Transaction not found');
  }
  const next: TransactionInput = {
    amount: input.amount ?? existing.amount,
    type: input.type ?? existing.type,
    category: input.category ?? existing.category,
    date: input.date ?? existing.date,
    notes: input.notes ?? existing.notes,
  };
  await execWrite(
    db,
    `UPDATE transactions SET amount = ?, type = ?, category = ?, date = ?, notes = ? WHERE id = ?`,
    [next.amount, next.type, next.category, next.date, next.notes, id],
  );
}

export async function deleteTransaction(db: LegacyDatabase, id: number): Promise<void> {
  await execWrite(db, `DELETE FROM transactions WHERE id = ?`, [id]);
}

export async function deleteAllTransactions(db: LegacyDatabase): Promise<void> {
  await execWrite(db, `DELETE FROM transactions`, []);
}

export async function getAllGoals(db: LegacyDatabase): Promise<Goal[]> {
  const rs = await execRead(
    db,
    `SELECT id, title, target, month, created_at FROM goals ORDER BY month DESC, id DESC`,
  );
  return rs.rows.map((row) => mapGoal(row as GoalRow));
}

export async function getGoalByMonth(db: LegacyDatabase, month: string): Promise<Goal | null> {
  const rs = await execRead(
    db,
    `SELECT id, title, target, month, created_at FROM goals WHERE month = ?`,
    [month],
  );
  const row = rs.rows[0] as GoalRow | undefined;
  return row ? mapGoal(row) : null;
}

export async function insertGoal(db: LegacyDatabase, input: GoalInput): Promise<number> {
  const rs = await execWrite(db, `INSERT INTO goals (title, target, month) VALUES (?, ?, ?)`, [
    input.title,
    input.target,
    input.month,
  ]);
  return Number(rs.insertId ?? 0);
}

export async function updateGoal(
  db: LegacyDatabase,
  id: number,
  input: Partial<GoalInput>,
): Promise<void> {
  const existingRow = await execRead(
    db,
    `SELECT id, title, target, month, created_at FROM goals WHERE id = ?`,
    [id],
  );
  const first = existingRow.rows[0] as GoalRow | undefined;
  if (!first) {
    throw new Error('Goal not found');
  }
  const existing = mapGoal(first);
  const next: GoalInput = {
    title: input.title ?? existing.title,
    target: input.target ?? existing.target,
    month: input.month ?? existing.month,
  };
  await execWrite(db, `UPDATE goals SET title = ?, target = ?, month = ? WHERE id = ?`, [
    next.title,
    next.target,
    next.month,
    id,
  ]);
}

export async function deleteGoal(db: LegacyDatabase, id: number): Promise<void> {
  await execWrite(db, `DELETE FROM goals WHERE id = ?`, [id]);
}

export async function deleteGoalByMonth(db: LegacyDatabase, month: string): Promise<void> {
  await execWrite(db, `DELETE FROM goals WHERE month = ?`, [month]);
}

export async function upsertGoalForMonth(db: LegacyDatabase, input: GoalInput): Promise<number> {
  const existing = await getGoalByMonth(db, input.month);
  if (existing) {
    await updateGoal(db, existing.id, input);
    return existing.id;
  }
  return insertGoal(db, input);
}
