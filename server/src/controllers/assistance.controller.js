import pool from "../config/db.js";

import {
  ok,
  fail,
} from "../utils/http.js";

import { pagination } from "../utils/query.js";
import { required } from "../utils/validation.js";

export async function createAssistance(req, res) {
  try {
    const missing = required(
      req.body,
      [
        "beneficiary_id",
        "support_type",
        "description",
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

    const [beneficiaryRows] =
      await pool.query(
        `
          SELECT id, status
          FROM beneficiaries
          WHERE id = ?
        `,
        [req.body.beneficiary_id]
      );

    if (!beneficiaryRows.length) {
      return fail(
        res,
        "Beneficiary not found",
        404
      );
    }

    const [result] =
      await pool.query(
        `
          INSERT INTO assistance_applications (
            beneficiary_id,
            support_type,
            requested_amount,
            description,
            urgency_level,
            uploaded_files,
            submitted_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.body.beneficiary_id,
          req.body.support_type,
          req.body.requested_amount || null,
          req.body.description,
          req.body.urgency_level || "Urgent",

          req.body.uploaded_files
            ? JSON.stringify(
                req.body.uploaded_files
              )
            : null,

          req.user.id,
        ]
      );

    return ok(
      res,
      {
        id: result.insertId,
        status: "Pending",
      },
      "Assistance application created successfully",
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

export async function listAssistance(req, res) {
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
        " AND a.status = ?";

      params.push(
        req.query.status
      );
    }

    if (req.query.beneficiary_id) {
      where +=
        " AND a.beneficiary_id = ?";

      params.push(
        req.query.beneficiary_id
      );
    }

    if (req.query.support_type) {
      where +=
        " AND a.support_type = ?";

      params.push(
        req.query.support_type
      );
    }

    const [countRows] =
      await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM assistance_applications a
          ${where}
        `,
        params
      );

    const [rows] =
      await pool.query(
        `
          SELECT
            a.*,
            b.full_name AS beneficiary_name,
            s.full_name AS submitted_by_name,
            r.full_name AS reviewed_by_name
          FROM assistance_applications a
          JOIN beneficiaries b
            ON b.id = a.beneficiary_id
          JOIN users s
            ON s.id = a.submitted_by
          LEFT JOIN users r
            ON r.id = a.reviewed_by
          ${where}
          ORDER BY a.created_at DESC
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

export async function getAssistance(req, res) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT
            a.*,
            b.full_name AS beneficiary_name,
            s.full_name AS submitted_by_name,
            v.full_name AS reviewed_by_name
          FROM assistance_applications a
          JOIN beneficiaries b
            ON b.id = a.beneficiary_id
          JOIN users s
            ON s.id = a.submitted_by
          LEFT JOIN users v
            ON v.id = a.reviewed_by
          WHERE a.id = ?
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Assistance application not found",
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

export async function updateAssistance(req, res) {
  try {
    const allowed = [
      "support_type",
      "requested_amount",
      "description",
      "urgency_level",
      "uploaded_files",
    ];

    const sets = [];
    const values = [];

    for (const field of allowed) {
      if (
        req.body[field] !== undefined
      ) {
        sets.push(
          `${field} = ?`
        );

        values.push(
          field === "uploaded_files"
            ? JSON.stringify(
                req.body[field]
              )
            : req.body[field]
        );
      }
    }

    if (!sets.length) {
      return fail(
        res,
        "No fields to update",
        400
      );
    }

    sets.push(
      "status = 'Pending'",
      "reviewed_by = NULL",
      "reviewed_at = NULL"
    );

    values.push(
      req.params.id
    );

    const [result] =
      await pool.query(
        `
          UPDATE assistance_applications
          SET ${sets.join(", ")}
          WHERE id = ?
        `,
        values
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Assistance application not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Assistance application updated and resubmitted"
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

export async function reviewAssistance(req, res) {
  try {
    const {
      status,
      review_notes,
    } = req.body;

    const allowedStatuses = [
      "Approved",
      "Rejected",
      "More_Info",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return fail(
        res,
        "Invalid review status",
        400
      );
    }

    const [result] =
      await pool.query(
        `
          UPDATE assistance_applications
          SET
            status = ?,
            reviewed_by = ?,
            reviewed_at = NOW(),
            review_notes = ?
          WHERE id = ?
        `,
        [
          status,
          req.user.id,
          review_notes || null,
          req.params.id,
        ]
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Assistance application not found",
        404
      );
    }

    return ok(
      res,
      null,
      `Assistance application ${status}`
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

