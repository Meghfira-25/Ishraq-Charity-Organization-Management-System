import pool from "../config/db.js";

import {
  ok,
  fail,
} from "../utils/http.js";

import {
  isEmail,
  required,
} from "../utils/validation.js";

import { pagination } from "../utils/query.js";

export async function submitContact(req, res) {
  try {
    const missing = required(
      req.body,
      [
        "full_name",
        "email",
        "message",
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

    if (!isEmail(req.body.email)) {
      return fail(
        res,
        "Invalid email format",
        400
      );
    }

    const [result] = await pool.query(
      `
        INSERT INTO contact_messages (
          full_name,
          email,
          phone_number,
          subject,
          message
        )
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        req.body.full_name,
        req.body.email
          .trim()
          .toLowerCase(),
        req.body.phone_number || null,
        req.body.subject || null,
        req.body.message,
      ]
    );

    return ok(
      res,
      {
        id: result.insertId,
      },
      "Message sent successfully",
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

export async function listContacts(req, res) {
  try {
    const {
      page,
      limit,
      offset,
    } = pagination(req.query);

    const params = [];

    let where = "WHERE 1=1";

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
          FROM contact_messages
          ${where}
        `,
        params
      );

    const [rows] =
      await pool.query(
        `
          SELECT *
          FROM contact_messages
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

export async function updateContact(req, res) {
  try {
    const allowedStatuses = [
      "New",
      "Read",
      "Resolved",
    ];

    if (
      !allowedStatuses.includes(
        req.body.status
      )
    ) {
      return fail(
        res,
        "Invalid status",
        400
      );
    }

    const [result] =
      await pool.query(
        `
          UPDATE contact_messages
          SET
            status = ?,
            handled_by = ?,
            handled_at = NOW()
          WHERE id = ?
        `,
        [
          req.body.status,
          req.user.id,
          req.params.id,
        ]
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Message not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Contact message updated"
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

export async function deleteContact(req, res) {
  try {
    const [result] =
      await pool.query(
        `
          DELETE FROM contact_messages
          WHERE id = ?
        `,
        [req.params.id]
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Message not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Message deleted successfully"
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

