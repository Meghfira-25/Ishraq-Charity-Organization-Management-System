import "dotenv/config";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

async function createAdmin() {
  const fullName =
    process.env.ADMIN_NAME ||
    "Meghfira Mohammed";

  const email = (
    process.env.ADMIN_EMAIL ||
    "ivy.megh0205@gmail.com"
  )
    .trim()
    .toLowerCase();

  const password =
    process.env.ADMIN_PASSWORD ||
    "Admin123!";

  try {
    const [existing] =
      await pool.query(
        `
          SELECT
            id,
            email,
            role,
            status
          FROM users
          WHERE email = ?
          LIMIT 1
        `,
        [email]
      );

    if (existing.length) {
      const user = existing[0];

      if (user.role !== "Admin") {
        console.log(
          `User exists but is not Admin: ${email}`
        );

        console.log(
          `Current role: ${user.role}`
        );

        process.exit(1);
      }

      console.log(
        `Admin already exists: ${email}`
      );

      console.log(
        `Status: ${user.status}`
      );

      process.exit(0);
    }

    const hash =
      await bcrypt.hash(
        password,
        12
      );

    await pool.query(
      `
        INSERT INTO users (
          full_name,
          email,
          password,
          role,
          status
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        fullName,
        email,
        hash,
        "Admin",
        "Active",
      ]
    );

    console.log(
      `Admin created successfully: ${email}`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      error.message
    );

    process.exit(1);
  }
}

createAdmin();

