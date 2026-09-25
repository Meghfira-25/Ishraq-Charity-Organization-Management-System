import bcrypt from "bcryptjs";
import pool from "../config/db.js";

import {
  ok,
  fail,
} from "../utils/http.js";

import { pagination } from "../utils/query.js";

import {
  isEmail,
  required,
  ROLES,
} from "../utils/validation.js";

export async function listStaff(req, res) {
  try {
    const {
      page,
      limit,
      offset,
    } = pagination(req.query);

    const search = String(
      req.query.search || ""
    ).trim();

    const params = [];

    let where = "WHERE 1=1";

    if (search) {
      where += `
        AND (
          full_name LIKE ?
          OR email LIKE ?
          OR phone_number LIKE ?
        )
      `;

      const searchValue =
        `%${search}%`;

      params.push(
        searchValue,
        searchValue,
        searchValue
      );
    }

    if (req.query.role) {
      where +=
        " AND role = ?";

      params.push(
        req.query.role
      );
    }

    if (req.query.status) {
      where +=
        " AND status = ?";

      params.push(
        req.query.status
      );
    }

    const [countRows] =
      await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM users
          ${where}
        `,
        params
      );

    const [rows] =
      await pool.query(
        `
          SELECT
            id,
            full_name,
            email,
            phone_number,
            profile_picture,
            role,
            status,
            created_at,
            updated_at
          FROM users
          ${where}
          ORDER BY created_at DESC
          LIMIT ? OFFSET ?
        `,
        [
          ...params,
          limit,
          offset,
        ]
      );

    const total =
      countRows[0].total;

    return ok(res, {
      items: rows,

      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(
          total / limit
        ),
      },
    });
  } catch (error) {
    console.error(error);

    return fail(
      res,
      "Server error",
      500
    );
  }
}

export async function getStaff(req, res) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT
            id,
            full_name,
            email,
            phone_number,
            profile_picture,
            role,
            status,
            created_at,
            updated_at
          FROM users
          WHERE id = ?
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Staff member not found",
        404
      );
    }

    return ok(
      res,
      rows[0]
    );
  } catch (error) {
    console.error(error);

    return fail(
      res,
      "Server error",
      500
    );
  }
}

export async function createStaff(req, res) {
  try {
    const missing = required(
      req.body,
      [
        "full_name",
        "email",
        "password",
        "role",
      ]
    );

    if (missing.length) {
      return fail(
        res,
        "Validation failed",
        400,
        {
          missing,
        }
      );
    }

    const {
      full_name,
      email,
      phone_number,
      password,
      role,
    } = req.body;

    if (!isEmail(email)) {
      return fail(
        res,
        "Invalid email format",
        400
      );
    }

    if (
      ![
        "Registration-Officer",
        "Distribution-Officer",
      ].includes(role)
    ) {
      return fail(
        res,
        "Invalid staff role",
        400
      );
    }

    if (
      String(password).length < 6
    ) {
      return fail(
        res,
        "Password must be at least 6 characters",
        400
      );
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const [existingRows] =
      await pool.query(
        `
          SELECT id
          FROM users
          WHERE email = ?
        `,
        [normalizedEmail]
      );

    if (existingRows.length) {
      return fail(
        res,
        "Email already exists",
        409
      );
    }

    const hash =
      await bcrypt.hash(
        password,
        12
      );

    const [result] =
      await pool.query(
        `
          INSERT INTO users (
            full_name,
            email,
            phone_number,
            password,
            role,
            status
          )
          VALUES (?, ?, ?, ?, ?, 'Active')
        `,
        [
          full_name.trim(),
          normalizedEmail,
          phone_number || null,
          hash,
          role,
        ]
      );

    return ok(
      res,
      {
        id: result.insertId,
        full_name:
          full_name.trim(),
        email:
          normalizedEmail,
        phone_number:
          phone_number || null,
        role,
        status: "Active",
      },
      "Staff account created successfully",
      201
    );
  } catch (error) {
    console.error(error);

    return fail(
      res,
      "Server error",
      500
    );
  }
}

export async function updateStaff(req, res) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT *
          FROM users
          WHERE id = ?
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Staff member not found",
        404
      );
    }

    const current =
      rows[0];

    const {
      full_name,
      email,
      phone_number,
      role,
      status,
    } = req.body;

    if (
      role &&
      !ROLES.includes(role)
    ) {
      return fail(
        res,
        "Invalid role",
        400
      );
    }

    if (
      status &&
      ![
        "Active",
        "Inactive",
      ].includes(status)
    ) {
      return fail(
        res,
        "Invalid status",
        400
      );
    }

    const newEmail =
      email
        ? email
            .trim()
            .toLowerCase()
        : current.email;

    if (!isEmail(newEmail)) {
      return fail(
        res,
        "Invalid email format",
        400
      );
    }

    const [duplicateRows] =
      await pool.query(
        `
          SELECT id
          FROM users
          WHERE email = ?
            AND id <> ?
        `,
        [
          newEmail,
          req.params.id,
        ]
      );

    if (duplicateRows.length) {
      return fail(
        res,
        "Email already exists",
        409
      );
    }

    await pool.query(
      `
        UPDATE users
        SET
          full_name = ?,
          email = ?,
          phone_number = ?,
          role = ?,
          status = ?
        WHERE id = ?
      `,
      [
        full_name ??
          current.full_name,

        newEmail,

        phone_number ??
          current.phone_number,

        role ??
          current.role,

        status ??
          current.status,

        req.params.id,
      ]
    );

    return ok(
      res,
      null,
      "Staff updated successfully"
    );
  } catch (error) {
    console.error(error);

    return fail(
      res,
      "Server error",
      500
    );
  }
}

export async function resetStaffPassword(
  req,
  res
) {
  try {
    const {
      password,
    } = req.body;

    if (
      !password ||
      String(password).length < 6
    ) {
      return fail(
        res,
        "Password must be at least 6 characters",
        400
      );
    }

    const hash =
      await bcrypt.hash(
        password,
        12
      );

    const [result] =
      await pool.query(
        `
          UPDATE users
          SET password = ?
          WHERE id = ?
        `,
        [
          hash,
          req.params.id,
        ]
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Staff member not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Password reset successfully"
    );
  } catch (error) {
    console.error(error);

    return fail(
      res,
      "Server error",
      500
    );
  }
}

