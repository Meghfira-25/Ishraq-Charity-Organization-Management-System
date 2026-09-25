import pool from "../config/db.js";
import {
  ok,
  fail,
} from "../utils/http.js";

import { pagination } from "../utils/query.js";
import {
  isEmail,
  required,
} from "../utils/validation.js";

export async function applyMember(req, res) {
  let connection;

  try {
    const missing = required(
      req.body,
      [
        "full_name",
        "gender",
        "email",
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

    connection =
      await pool.getConnection();

    await connection.beginTransaction();

    const email =
      req.body.email
        .trim()
        .toLowerCase();

    const [duplicateRows] =
      await connection.query(
        `
          SELECT id
          FROM members
          WHERE email = ?
        `,
        [email]
      );

    if (duplicateRows.length) {
      await connection.rollback();

      return fail(
        res,
        "A membership application with this email already exists",
        409
      );
    }

    const fields = [
      "photo",
      "full_name",
      "age",
      "gender",
      "nationality",
      "birth_date",
      "marriage_status",
      "education_level",
      "assigned_responsibility",
      "city",
      "subcity",
      "woreda",
      "kebele",
      "email",
      "phone_number",
    ];

    const values = fields.map(
      (field) =>
        field === "email"
          ? email
          : req.body[field] ?? null
    );

    const [result] =
      await connection.query(
        `
          INSERT INTO members
          (${fields.join(", ")})
          VALUES
          (${fields
            .map(() => "?")
            .join(", ")})
        `,
        values
      );

    const experiences =
      Array.isArray(
        req.body.experiences
      )
        ? req.body.experiences
        : [];

    for (const experience of experiences) {
      if (
        !experience.organization_name ||
        !experience.responsibility ||
        experience.years_worked === undefined
      ) {
        continue;
      }

      await connection.query(
        `
          INSERT INTO member_charity_experience (
            member_id,
            organization_name,
            responsibility,
            years_worked
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          result.insertId,
          experience.organization_name,
          experience.responsibility,
          experience.years_worked,
        ]
      );
    }

    await connection.commit();

    return ok(
      res,
      {
        id: result.insertId,
        status: "Pending",
      },
      "Membership application submitted successfully",
      201
    );
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error(error);

    return fail(
      res,
      "Server error",
      500
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function listMembers(req, res) {
  try {
    const {
      page,
      limit,
      offset,
    } = pagination(req.query);

    const params = [];

    let where =
      "WHERE 1=1";

    if (req.query.search) {
      where += `
        AND (
          m.full_name LIKE ?
          OR m.email LIKE ?
          OR m.phone_number LIKE ?
        )
      `;

      const search =
        `%${req.query.search}%`;

      params.push(
        search,
        search,
        search
      );
    }

    if (req.query.status) {
      where +=
        " AND m.status = ?";

      params.push(
        req.query.status
      );
    }

    const [countRows] =
      await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM members m
          ${where}
        `,
        params
      );

    const [rows] =
      await pool.query(
        `
          SELECT
            m.*,
            u.full_name AS reviewed_by_name
          FROM members m
          LEFT JOIN users u
            ON u.id = m.reviewed_by
          ${where}
          ORDER BY m.created_at DESC
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

export async function getMember(req, res) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT
            m.*,
            u.full_name AS reviewed_by_name
          FROM members m
          LEFT JOIN users u
            ON u.id = m.reviewed_by
          WHERE m.id = ?
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Member application not found",
        404
      );
    }

    const [experiences] =
      await pool.query(
        `
          SELECT *
          FROM member_charity_experience
          WHERE member_id = ?
          ORDER BY id
        `,
        [req.params.id]
      );

    return ok(res, {
      ...rows[0],
      experiences,
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

export async function reviewMember(req, res) {
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
          UPDATE members
          SET
            status = ?,
            reviewed_by = ?,
            reviewed_at = NOW(),
            review_notes = ?,
            membership_date =
              IF(
                ? = 'Approved',
                COALESCE(
                  membership_date,
                  CURDATE()
                ),
                membership_date
              )
          WHERE id = ?
        `,
        [
          status,
          req.user.id,
          review_notes || null,
          status,
          req.params.id,
        ]
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Member application not found",
        404
      );
    }

    return ok(
      res,
      null,
      `Membership application ${status}`
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

export async function updateMemberApplication(
  req,
  res
) {
  try {
    const allowed = [
      "photo",
      "full_name",
      "age",
      "gender",
      "nationality",
      "birth_date",
      "marriage_status",
      "education_level",
      "assigned_responsibility",
      "city",
      "subcity",
      "woreda",
      "kebele",
      "phone_number",
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
          UPDATE members
          SET ${sets.join(", ")}
          WHERE id = ?
        `,
        values
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Member not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Member updated successfully"
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

