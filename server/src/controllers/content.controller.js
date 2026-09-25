import pool from "../config/db.js";
import {
  ok,
  fail,
} from "../utils/http.js";

import { pagination } from "../utils/query.js";
import { required } from "../utils/validation.js";

const editable = [
  "title",
  "content_type",
  "short_description",
  "description",
  "image",
  "event_date",
  "location",
  "activity_id",
  "status",
];

export async function publicContent(req, res) {
  try {
    const params = [];

    let where =
      "WHERE status = 'Published'";

    if (req.query.type) {
      where +=
        " AND content_type = ?";

      params.push(
        req.query.type
      );
    }

    const [rows] =
      await pool.query(
        `
          SELECT
            id,
            title,
            content_type,
            short_description,
            description,
            image,
            event_date,
            location,
            activity_id,
            published_at,
            created_at
          FROM content
          ${where}
          ORDER BY
            COALESCE(
              event_date,
              DATE(created_at)
            ) DESC
        `,
        params
      );

    return ok(
      res,
      rows
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

export async function publicContentById(
  req,
  res
) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT
            id,
            title,
            content_type,
            short_description,
            description,
            image,
            event_date,
            location,
            activity_id,
            published_at,
            created_at
          FROM content
          WHERE id = ?
            AND status = 'Published'
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Content not found",
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

export async function listContent(req, res) {
  try {
    const {
      page,
      limit,
      offset,
    } = pagination(req.query);

    const params = [];

    let where =
      "WHERE 1=1";

    if (req.query.type) {
      where +=
        " AND c.content_type = ?";

      params.push(
        req.query.type
      );
    }

    if (req.query.status) {
      where +=
        " AND c.status = ?";

      params.push(
        req.query.status
      );
    }

    const [countRows] =
      await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM content c
          ${where}
        `,
        params
      );

    const [rows] =
      await pool.query(
        `
          SELECT
            c.*,
            u.full_name AS created_by_name
          FROM content c
          JOIN users u
            ON u.id = c.created_by
          ${where}
          ORDER BY c.created_at DESC
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

export async function createContent(req, res) {
  try {
    const missing = required(
      req.body,
      [
        "title",
        "content_type",
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

    const status =
      req.body.status || "Draft";

    const fields = [
      ...editable,
      "created_by",
      "published_at",
    ];

    const values = editable.map(
      (field) => {
        if (field === "status") {
          return status;
        }

        return (
          req.body[field] ?? null
        );
      }
    );

    values.push(
      req.user.id,
      status === "Published"
        ? new Date()
        : null
    );

    const [result] =
      await pool.query(
        `
          INSERT INTO content
          (${fields.join(", ")})
          VALUES
          (${fields
            .map(() => "?")
            .join(", ")})
        `,
        values
      );

    return ok(
      res,
      {
        id: result.insertId,
      },
      "Content created successfully",
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

export async function updateContent(req, res) {
  try {
    const [existingRows] =
      await pool.query(
        `
          SELECT *
          FROM content
          WHERE id = ?
        `,
        [req.params.id]
      );

    if (!existingRows.length) {
      return fail(
        res,
        "Content not found",
        404
      );
    }

    const existing =
      existingRows[0];

    const sets = [];
    const values = [];

    for (const field of editable) {
      if (
        req.body[field] !== undefined
      ) {
        sets.push(
          `${field} = ?`
        );

        values.push(
          req.body[field]
        );
      }
    }

    if (
      req.body.status ===
        "Published" &&
      existing.status !==
        "Published"
    ) {
      sets.push(
        "published_at = NOW()"
      );
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

    await pool.query(
      `
        UPDATE content
        SET ${sets.join(", ")}
        WHERE id = ?
      `,
      values
    );

    return ok(
      res,
      null,
      "Content updated successfully"
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

export async function deleteContent(req, res) {
  try {
    const [result] =
      await pool.query(
        `
          DELETE FROM content
          WHERE id = ?
        `,
        [req.params.id]
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Content not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Content deleted successfully"
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

