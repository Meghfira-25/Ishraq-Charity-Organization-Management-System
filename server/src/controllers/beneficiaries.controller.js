import pool from "../config/db.js";

import {
  ok,
  fail,
} from "../utils/http.js";

import { pagination } from "../utils/query.js";
import { required } from "../utils/validation.js";

const EDITABLE = [
  "full_name",
  "age",
  "gender",
  "nationality",
  "birth_date",
  "marriage_status",
  "education_level",
  "source_of_income",
  "monthly_income",
  "phone_number",
  "city",
  "woreda",
  "kebele",
  "address",
  "home_ownership",
  "house_rooms",
  "has_external_support",
  "external_support",
  "support_type",
  "notes",
  "uploaded_files",
];

export async function createBeneficiary(req, res) {
  let connection;

  try {
    const missing = required(
      req.body,
      [
        "full_name",
        "gender",
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

    const proofs = Array.isArray(
      req.body.uploaded_files
    )
      ? req.body.uploaded_files
      : [];

    if (!proofs.length) {
      return fail(
        res,
        "At least one supporting beneficiary proof file is required",
        400
      );
    }

    connection =
      await pool.getConnection();

    await connection.beginTransaction();

    const fields = [
      ...EDITABLE,
      "registered_by",
    ];

    const values = EDITABLE.map(
      (field) => {
        if (
          field === "uploaded_files" &&
          req.body[field] !== undefined
        ) {
          return JSON.stringify(
            req.body[field]
          );
        }

        return (
          req.body[field] ?? null
        );
      }
    );

    values.push(req.user.id);

    const [result] =
      await connection.query(
        `
          INSERT INTO beneficiaries
          (${fields.join(", ")})
          VALUES
          (${fields
            .map(() => "?")
            .join(", ")})
        `,
        values
      );

    const children = Array.isArray(
      req.body.children
    )
      ? req.body.children
      : [];

    for (const child of children) {
      if (!child.full_name) {
        continue;
      }

      await connection.query(
        `
          INSERT INTO beneficiary_children (
            beneficiary_id,
            full_name,
            birth_date,
            gender,
            education_level,
            school_name,
            health_status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          result.insertId,
          child.full_name,
          child.birth_date || null,
          child.gender || null,
          child.education_level || null,
          child.school_name || null,
          child.health_status || null,
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
      "Beneficiary registered successfully",
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

export async function listBeneficiaries(
  req,
  res
) {
  try {
    const {
      page,
      limit,
      offset,
    } = pagination(req.query);

    const params = [];

    let where = "WHERE 1=1";

    if (req.query.search) {
      where += `
        AND (
          b.full_name LIKE ?
          OR b.phone_number LIKE ?
          OR b.city LIKE ?
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
        " AND b.status = ?";

      params.push(
        req.query.status
      );
    }

    if (req.query.support_type) {
      where +=
        " AND b.support_type = ?";

      params.push(
        req.query.support_type
      );
    }

    const [countRows] =
      await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM beneficiaries b
          ${where}
        `,
        params
      );

    const [rows] =
      await pool.query(
        `
          SELECT
            b.*,
            r.full_name AS registered_by_name,
            v.full_name AS reviewed_by_name
          FROM beneficiaries b
          JOIN users r
            ON r.id = b.registered_by
          LEFT JOIN users v
            ON v.id = b.reviewed_by
          ${where}
          ORDER BY b.registration_date DESC
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

export async function getBeneficiary(
  req,
  res
) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT
            b.*,
            u.full_name AS registered_by_name,
            v.full_name AS reviewed_by_name
          FROM beneficiaries b
          JOIN users u
            ON u.id = b.registered_by
          LEFT JOIN users v
            ON v.id = b.reviewed_by
          WHERE b.id = ?
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Beneficiary not found",
        404
      );
    }

    const [children] =
      await pool.query(
        `
          SELECT *
          FROM beneficiary_children
          WHERE beneficiary_id = ?
          ORDER BY id
        `,
        [req.params.id]
      );

    const [assistanceApplications] =
      await pool.query(
        `
          SELECT
            id,
            support_type,
            requested_amount,
            urgency_level,
            status,
            created_at
          FROM assistance_applications
          WHERE beneficiary_id = ?
          ORDER BY created_at DESC
        `,
        [req.params.id]
      );

    const [distributions] =
      await pool.query(
        `
          SELECT
            d.id,
            d.quantity,
            d.unit,
            d.distribution_date,
            d.status,
            r.resource_name
          FROM distributions d
          JOIN resources r
            ON r.id = d.resource_id
          WHERE d.beneficiary_id = ?
          ORDER BY d.distribution_date DESC
        `,
        [req.params.id]
      );

    return ok(res, {
      ...rows[0],
      children,
      assistance_applications:
        assistanceApplications,
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

export async function updateBeneficiary(
  req,
  res
) {
  try {
    const sets = [];
    const values = [];

    for (const field of EDITABLE) {
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

    values.push(
      req.params.id
    );

    const [result] =
      await pool.query(
        `
          UPDATE beneficiaries
          SET ${sets.join(", ")}
          WHERE id = ?
        `,
        values
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Beneficiary not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Beneficiary updated successfully"
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

export async function reviewBeneficiary(
  req,
  res
) {
  try {
    const {
      status,
      review_notes,
    } = req.body;

    if (
      ![
        "Approved",
        "Rejected",
      ].includes(status)
    ) {
      return fail(
        res,
        "Status must be Approved or Rejected",
        400
      );
    }

    const [result] =
      await pool.query(
        `
          UPDATE beneficiaries
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
        "Beneficiary not found",
        404
      );
    }

    return ok(
      res,
      null,
      `Beneficiary ${status.toLowerCase()} successfully`
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

export async function addChild(
  req,
  res
) {
  try {
    if (!req.body.full_name) {
      return fail(
        res,
        "Child full_name is required",
        400
      );
    }

    const [beneficiaryRows] =
      await pool.query(
        `
          SELECT id
          FROM beneficiaries
          WHERE id = ?
        `,
        [req.params.id]
      );

    if (!beneficiaryRows.length) {
      return fail(
        res,
        "Beneficiary not found",
        404
      );
    }

    const child = req.body;

    const [result] =
      await pool.query(
        `
          INSERT INTO beneficiary_children (
            beneficiary_id,
            full_name,
            birth_date,
            gender,
            education_level,
            school_name,
            health_status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.params.id,
          child.full_name,
          child.birth_date || null,
          child.gender || null,
          child.education_level || null,
          child.school_name || null,
          child.health_status || null,
        ]
      );

    return ok(
      res,
      {
        id: result.insertId,
      },
      "Child added successfully",
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

export async function updateChild(
  req,
  res
) {
  try {
    const allowed = [
      "full_name",
      "birth_date",
      "gender",
      "education_level",
      "school_name",
      "health_status",
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
      req.params.childId,
      req.params.id
    );

    const [result] =
      await pool.query(
        `
          UPDATE beneficiary_children
          SET ${sets.join(", ")}
          WHERE id = ?
            AND beneficiary_id = ?
        `,
        values
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Child not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Child updated successfully"
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

export async function deleteChild(
  req,
  res
) {
  try {
    const [result] =
      await pool.query(
        `
          DELETE FROM beneficiary_children
          WHERE id = ?
            AND beneficiary_id = ?
        `,
        [
          req.params.childId,
          req.params.id,
        ]
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Child not found",
        404
      );
    }

    return ok(
      res,
      null,
      "Child deleted successfully"
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

