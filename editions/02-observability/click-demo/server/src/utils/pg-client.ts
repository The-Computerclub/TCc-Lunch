import { AsyncLocalStorage } from "async_hooks";
import type pg from "pg";
import { usePgPool } from "./pg-pool.js";

const storage = new AsyncLocalStorage<pg.PoolClient>();

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

export function usePgClient(): pg.PoolClient {
  const database = storage.getStore();
  if (database == null) {
    throw new TypeError("pg client not in context");
  }
  return database;
}
