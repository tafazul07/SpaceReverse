import dotenv from      "dotenv";
import pg from "pg";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;
const currentDirectory = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(currentDirectory, "../.env") });

if (!process.env.DATA_CONNECTION) {
	throw new Error("DATA_CONNECTION is missing from the environment.");
}

const pool = new Pool({
	connectionString: process.env.DATA_CONNECTION,
});

pool.on("error", (error) => {
	console.error("Unexpected PostgreSQL pool error:", error);
});

export default pool;
export const query = (text, parameters) => pool.query(text, parameters);
