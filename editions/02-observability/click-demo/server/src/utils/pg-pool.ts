import { AsyncLocalStorage } from "async_hooks";
import pg from "pg";

export interface PgPoolConfiguration {
  pgUri: string;
}

const storage = new AsyncLocalStorage<pg.Pool>();

export async function withPgPool<T>(
  configuration: PgPoolConfiguration,
  job: (pool: pg.Pool) => Promise<T>
): Promise<T> {
  const { pgUri } = configuration;

  const pgPool = new pg.Pool({ connectionString: pgUri });
  try {
    const result = await storage.run(pgPool, job, pgPool);
    return result;
  } finally {
    await pgPool.end();
  }
}

export function usePgPool(): pg.Pool {
  const database = storage.getStore();
  if (database == null) {
    throw new TypeError("pg pool not in context");
  }
  return database;
}