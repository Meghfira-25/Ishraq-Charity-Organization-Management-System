import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { ok, fail } from "../utils/http.js";
import { isEmail } from "../utils/validation.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return fail(
        res,
        "Email and password are required",
        400
      );
    }

    if (!isEmail(email)) {
      return fail(
        res,
        "Invalid email format",
        400
      );
    }

    const normalized = email
      .trim()
      .toLowerCase();

    const [rows] = await pool.query(
      `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [normalized]
    );

    if (!rows.length) {
      return fail(
        res,
        "Invalid email or password",
        401
      );
    }

    const user = rows[0];

    if (user.status !== "Active") {
      return fail(
        res,
        "Account is inactive",
        403
      );
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return fail(
        res,
        "Invalid email or password",
        401
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing from .env"
      );

      return fail(
        res,
        "Server configuration error",
        500
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:
          process.env.JWT_EXPIRES_IN ||
          "1d",
      }
    );

    return ok(
      res,
      {
        token,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone_number:
            user.phone_number,
          profile_picture:
            user.profile_picture,
          role: user.role,
          status: user.status,
        },
      },
      "Login successful"
    );
  } catch (error) {
    console.error(
      "LOGIN ERROR:",
      error
    );

    return fail(
      res,
      "Server error",
      500
    );
  }
}

export function me(req, res) {
  return ok(
    res,
    req.user,
    "Current user retrieved successfully"
  );
}

export async function updateProfile(
  req,
  res
) {
  try {
    const fullName = String(
      req.body.full_name || ""
    ).trim();

    const phoneNumber = String(
      req.body.phone_number || ""
    ).trim();

    const profilePicture =
      req.body.profile_picture ===
      undefined
        ? req.user.profile_picture
        : req.body.profile_picture ||
          null;

    if (!fullName) {
      return fail(
        res,
        "Full name is required",
        400
      );
    }

    if (fullName.length > 100) {
      return fail(
        res,
        "Full name is too long",
        400
      );
    }

    if (phoneNumber.length > 20) {
      return fail(
        res,
        "Phone number is too long",
        400
      );
    }

    await pool.query(
      `
        UPDATE users
        SET
          full_name = ?,
          phone_number = ?,
          profile_picture = ?
        WHERE id = ?
      `,
      [
        fullName,
        phoneNumber || null,
        profilePicture,
        req.user.id,
      ]
    );

    const [rows] = await pool.query(
      `
        SELECT
          id,
          full_name,
          email,
          phone_number,
          profile_picture,
          role,
          status
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [req.user.id]
    );

    return ok(
      res,
      rows[0],
      "Profile updated successfully"
    );
  } catch (error) {
    console.error(
      "UPDATE PROFILE ERROR:",
      error
    );

    return fail(
      res,
      "Unable to update profile",
      500
    );
  }
}

export async function changePassword(
  req,
  res
) {
  try {
    const {
      current_password,
      new_password,
    } = req.body;

    if (
      !current_password ||
      !new_password
    ) {
      return fail(
        res,
        "Current password and new password are required",
        400
      );
    }

    if (
      String(new_password).length < 8
    ) {
      return fail(
        res,
        "New password must be at least 8 characters",
        400
      );
    }

    if (
      current_password ===
      new_password
    ) {
      return fail(
        res,
        "New password must be different from the current password",
        400
      );
    }

    const [rows] = await pool.query(
      `
        SELECT password
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [req.user.id]
    );

    if (!rows.length) {
      return fail(
        res,
        "User not found",
        404
      );
    }

    const valid =
      await bcrypt.compare(
        current_password,
        rows[0].password
      );

    if (!valid) {
      return fail(
        res,
        "Current password is incorrect",
        400
      );
    }

    const hash =
      await bcrypt.hash(
        new_password,
        12
      );

    await pool.query(
      `
        UPDATE users
        SET password = ?
        WHERE id = ?
      `,
      [
        hash,
        req.user.id,
      ]
    );

    return ok(
      res,
      null,
      "Password changed successfully"
    );
  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return fail(
      res,
      "Unable to change password",
      500
    );
  }
}

export function logout(req, res) {
  return ok(
    res,
    null,
    "Logout successful"
  );
}