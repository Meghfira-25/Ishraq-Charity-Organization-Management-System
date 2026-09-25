import pool from "../config/db.js";

import {
  ok,
  fail,
} from "../utils/http.js";

import { pagination } from "../utils/query.js";
import { required } from "../utils/validation.js";

const editable = [
  "title",
  "activity_type",
  "description",
  "target_beneficiaries",
  "location",
  "start_date",
  "end_date",
  "status",
  "responsible_staff_id",
  "notes",
];

export async function createActivity(req, res) {
  try {
    const missing = required(
      req.body,
      [
        "title",
        "activity_type",
        "start_date",
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

    const fields = [
      ...editable,
      "created_by",
    ];

    const values = editable.map(
      (field) =>
        req.body[field] ?? null
    );

    values.push(req.user.id);

    const [result] =
      await pool.query(
        `
          INSERT INTO activities
          (${fields.join(",")})
          VALUES
          (${fields
            .map(() => "?")
            .join(",")})
        `,
        values
      );

    return ok(
      res,
      {
        id: result.insertId,
      },
      "Activity created successfully",
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

export async function listActivities(req, res) {
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
        " AND a.status=?";

      params.push(
        req.query.status
      );
    }

    if (req.query.activity_type) {
      where +=
        " AND a.activity_type=?";

      params.push(
        req.query.activity_type
      );
    }

    const [countRows] =
      await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM activities a
          ${where}
        `,
        params
      );

    const [rows] =
      await pool.query(
        `
          SELECT
            a.*,
            c.full_name AS created_by_name,
            s.full_name AS responsible_staff_name
          FROM activities a
          JOIN users c
            ON c.id = a.created_by
          LEFT JOIN users s
            ON s.id = a.responsible_staff_id
          ${where}
          ORDER BY a.start_date DESC
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

export async function getActivity(req, res) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT
            a.*,
            c.full_name AS created_by_name,
            s.full_name AS responsible_staff_name
          FROM activities a
          JOIN users c
            ON c.id = a.created_by
          LEFT JOIN users s
            ON s.id = a.responsible_staff_id
          WHERE a.id = ?
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Activity not found",
        404
      );
    }

    const [distributions] =
      await pool.query(
        `
          SELECT
            d.*,
            b.full_name AS beneficiary_name,
            r.resource_name
          FROM distributions d
          JOIN beneficiaries b
            ON b.id = d.beneficiary_id
          JOIN resources r
            ON r.id = d.resource_id
          WHERE d.activity_id = ?
        `,
        [req.params.id]
      );

    return ok(res, {
      ...rows[0],
      distributions,
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

export async function updateActivity(req, res) {
  try {
    const sets = [];
    const values = [];

    for (const field of editable) {
      if (
        req.body[field] !== undefined
      ) {
        sets.push(
          `${field}=?`
        );

        values.push(
          req.body[field]
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

    values.push(
      req.params.id
    );

    const [result] =
      await pool.query(
        `
          UPDATE activities
          SET ${sets.join(",")}
          WHERE id = ?
        `,
        values
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Activity not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Activity updated successfully"
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

export async function deleteActivity(req, res) {
  try {
    const [result] =
      await pool.query(
        `
          DELETE FROM activities
          WHERE id = ?
        `,
        [req.params.id]
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Activity not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Activity deleted successfully"
    );
  } catch (error) {
    console.error(error);

    return fail(
      res,
      "Activity cannot be deleted while related records exist",
      409
    );
  }
}

