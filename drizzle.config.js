import { defineConfig } from "drizzle-kit";

const { POSTGRES_SERVER, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASS } =
  process.env;

console.log(POSTGRES_SERVER);
export default defineConfig({
  dialect: "postgresql", // "mysql" | "sqlite" | "postgresql"
  schema: "./src/lib/server/schema/schema.js",
  out: "./drizzle",
  schemaFilter: ["karwei"],
  dbCredentials: {
    url: `postgres://${POSTGRES_USER}:${POSTGRES_PASS}@${POSTGRES_SERVER}:${POSTGRES_PORT}/postgres`,
  },
});
