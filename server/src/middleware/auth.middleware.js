import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { fail } from "../utils/http.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return fail(
        res,
        "Authentication required",
        401
      );
    }

    const token = header.slice(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
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
      [decoded.id]
    );

    if (!rows.length) {
      return fail(
        res,
        "User not found",
        401
      );
    }

    if (rows[0].status !== "Active") {
      return fail(
        res,
        "Account is inactive",
        403
      );
    }

    req.user = rows[0];

    next();
  } catch (error) {
    return fail(
      res,
      "Invalid or expired token",
      401
    );
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return fail(
        res,
        "Authentication required",
        401
      );
    }

    if (!roles.includes(req.user.role)) {
      return fail(
        res,
        "You are not authorized to perform this action",
        403
      );
    }

    next();
  };
}

