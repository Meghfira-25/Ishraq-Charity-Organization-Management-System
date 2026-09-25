import "dotenv/config";
import app from "./src/app.js";
import pool from "./src/config/db.js";

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL connected successfully");
    app.listen(PORT, () => {
      console.log(`Ishraq API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

start();
