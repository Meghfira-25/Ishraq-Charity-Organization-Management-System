import bcrypt from "bcryptjs";
import pool from "./src/config/db.js";

async function resetAdmin() {
  try {
    const email =
      "ivy.megh0205@gmail.com";

    const newPassword =
      "Admin123!";

    const hash =
      await bcrypt.hash(
        newPassword,
        12
      );

    const [result] =
      await pool.query(
        `
          UPDATE users
          SET
            password = ?,
            status = 'Active'
          WHERE email = ?
            AND role = 'Admin'
        `,
        [
          hash,
          email
            .trim()
            .toLowerCase(),
        ]
      );

    if (!result.affectedRows) {
      console.log(
        "Admin account not found."
      );
    } else {
      console.log(
        "Admin password reset successfully."
      );
    }
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

resetAdmin();

