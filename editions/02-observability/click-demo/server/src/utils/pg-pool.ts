import { AsyncLocalStorage } from "async_hooks";
import pg from "pg";

/**
 * A configuration interface for a PostgreSQL pool.
 */
export interface PgPoolConfiguration {
  /**
   * The PostgreSQL connection URI.
   */
  pgUri: string;
}

const storage = new AsyncLocalStorage<pg.Pool>();

/**
 * A function that runs a job within the context of a PostgreSQL pool.
 *
 * @param configuration - The configuration for the PostgreSQL pool.
 * @param job - The function to be executed within the context of the pool.
 * @returns The result of the job.
 */
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

/**
 * A function that retrieves the current PostgreSQL pool from the global storage.
 *
 * @returns The current PostgreSQL pool.
 * @throws {TypeError} If no PostgreSQL pool is found in the context.
 */
export function usePgPool(): pg.Pool {
  const database = storage.getStore();
  if (database == null) {
    throw new TypeError("pg pool not in context");
  }
  return database;
}
