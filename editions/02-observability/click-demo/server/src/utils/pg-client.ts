import { AsyncLocalStorage } from "async_hooks";
import pg from "pg";
import { usePgPool } from "./pg-pool.js";

const storage = new AsyncLocalStorage<pg.PoolClient>();

/**
 * Executes the provided job function with a PostgreSQL client from the AsyncLocalStorage.
 *
 * @param {Function} job - A function that takes a PostgreSQL client and returns a Promise.
 * @returns {Promise<T>} A Promise that resolves to the result of the provided job function.
 */
export async function withPgClient<T>(
  job: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const pgPool = usePgPool();
  const pgClient = await pgPool.connect();
  try {
    const result = await storage.run(pgClient, job, pgClient);
    pgClient.release();
    return result;
  } catch (error) {
    pgClient.release(true);
    throw error;
  }
}

/**
 * Retrieves the current PostgreSQL client from the AsyncLocalStorage.
 *
 * @returns {pg.PoolClient} The current PostgreSQL client.
 *
 * @throws {TypeError} If no PostgreSQL client is found in the context.
 */
export function usePgClient(): pg.PoolClient {
  const database = storage.getStore();
  if (database == null) {
    throw new TypeError("pg client not in context");
  }
  return database;
}
