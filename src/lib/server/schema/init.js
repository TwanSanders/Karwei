import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  POSTGRES_SERVER,
  POSTGRES_PORT,
  POSTGRES_USER,
  POSTGRES_PASS,
} from "$env/static/private";

export function init() {
  const databaseUrl = `postgres://${POSTGRES_USER}:${POSTGRES_PASS}@${POSTGRES_SERVER}:${POSTGRES_PORT}/postgres`;

  // Initialize Db client
  const client = postgres(databaseUrl);
  const db = drizzle(client, {
    logger: true,
  });
  return db;
}
