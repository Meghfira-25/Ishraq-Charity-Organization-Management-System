import pool from "../config/db.js";
import { ok, fail } from "../utils/http.js";
import { pagination } from "../utils/query.js";
import { required } from "../utils/validation.js";

const editable = [
  "title",
  "year",
  "short_description",
  "description",
  "status",
  "start_date",
  "end_date",
  "target_value",
  "current_value",
  "target_unit",
  "beneficiaries",
  "cover_image",
  "result_summary",
];

function normalizePlanBody(body = {}) {
  const normalized = { ...body };

  for (const field of ["target_value", "current_value", "beneficiaries"]) {
    if (normalized[field] === "") normalized[field] = 0;
  }

  for (const field of ["start_date", "end_date", "cover_image", "result_summary"]) {
    if (normalized[field] === "") normalized[field] = null;
  }

  return normalized;
}

async function imagesForPlan(planId) {
  const [images] = await pool.query(
    `
      SELECT id, plan_id, image_url, caption, created_at
      FROM annual_plan_images
      WHERE plan_id = ?
      ORDER BY id ASC
    `,
    [planId]
  );

  return images;
}

export async function publicPlans(req, res) {
  try {
    const params = [];
    let where = "WHERE is_published = 1";

    if (req.query.year) {
      where += " AND year = ?";
      params.push(req.query.year);
    }

    if (req.query.status) {
      where += " AND status = ?";
      params.push(req.query.status);
    }

    const [rows] = await pool.query(
      `
        SELECT *
        FROM annual_plans
        ${where}
        ORDER BY year DESC,
          FIELD(status, 'Ongoing', 'Upcoming', 'Planned', 'Completed'),
          COALESCE(start_date, created_at) ASC
      `,
      params
    );

    const data = await Promise.all(
      rows.map(async (plan) => ({
        ...plan,
        images: await imagesForPlan(plan.id),
      }))
    );

    return ok(res, data);
  } catch (error) {
    console.error(error);
    return fail(res, "Server error", 500);
  }
}

export async function publicPlanById(req, res) {
  try {
    const [rows] = await pool.query(
      `
        SELECT *
        FROM annual_plans
        WHERE id = ? AND is_published = 1
      `,
      [req.params.id]
    );

    if (!rows.length) {
      return fail(res, "Annual plan not found", 404);
    }

    return ok(res, {
      ...rows[0],
      images: await imagesForPlan(req.params.id),
    });
  } catch (error) {
    console.error(error);
    return fail(res, "Server error", 500);
  }
}

export async function listPlans(req, res) {
  try {
    const { page, limit, offset } = pagination(req.query);
    const params = [];
    let where = "WHERE 1=1";

    if (req.query.year) {
      where += " AND year = ?";
      params.push(req.query.year);
    }

    if (req.query.status) {
      where += " AND status = ?";
      params.push(req.query.status);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM annual_plans ${where}`,
      params
    );

    const [rows] = await pool.query(
      `
        SELECT *
        FROM annual_plans
        ${where}
        ORDER BY year DESC, created_at DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    return ok(res, {
      items: rows,
      pagination: {
        page,
        limit,
        total: countRows[0].total,
        pages: Math.ceil(countRows[0].total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return fail(res, "Server error", 500);
  }
}


export async function getPlan(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM annual_plans WHERE id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return fail(res, "Annual plan not found", 404);
    }

    return ok(res, {
      ...rows[0],
      images: await imagesForPlan(req.params.id),
    });
  } catch (error) {
    console.error(error);
    return fail(res, "Server error", 500);
  }
}

export async function createPlan(req, res) {
  try {
    const body = normalizePlanBody(req.body);
    const missing = required(body, ["title", "year"]);

    if (missing.length) {
      return fail(res, "Validation failed", 400, { missing });
    }

    const fields = [...editable, "is_published", "created_by"];
    const values = editable.map((field) => body[field] ?? null);
    values.push(body.is_published ? 1 : 0, req.user.id);

    const [result] = await pool.query(
      `
        INSERT INTO annual_plans (${fields.join(",")})
        VALUES (${fields.map(() => "?").join(",")})
      `,
      values
    );

    return ok(res, { id: result.insertId }, "Annual plan created successfully", 201);
  } catch (error) {
    console.error(error);
    return fail(res, "Server error", 500);
  }
}

export async function updatePlan(req, res) {
  try {
    const body = normalizePlanBody(req.body);
    const sets = [];
    const values = [];

    for (const field of editable) {
      if (body[field] !== undefined) {
        sets.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (body.is_published !== undefined) {
      sets.push("is_published = ?");
      values.push(body.is_published ? 1 : 0);
    }

    if (!sets.length) {
      return fail(res, "No fields to update", 400);
    }

    values.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE annual_plans SET ${sets.join(", ")} WHERE id = ?`,
      values
    );

    if (!result.affectedRows) {
      return fail(res, "Annual plan not found", 404);
    }

    return ok(res, null, "Annual plan updated successfully");
  } catch (error) {
    console.error(error);
    return fail(res, "Server error", 500);
  }
}

export async function deletePlan(req, res) {
  try {
    const [result] = await pool.query(
      "DELETE FROM annual_plans WHERE id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      return fail(res, "Annual plan not found", 404);
    }

    return ok(res, null, "Annual plan deleted successfully");
  } catch (error) {
    console.error(error);
    return fail(res, "Server error", 500);
  }
}

export async function addPlanImage(req, res) {
  try {
    const missing = required(req.body, ["image_url"]);

    if (missing.length) {
      return fail(res, "Image URL is required", 400, { missing });
    }

    const [planRows] = await pool.query(
      "SELECT id FROM annual_plans WHERE id = ?",
      [req.params.id]
    );

    if (!planRows.length) {
      return fail(res, "Annual plan not found", 404);
    }

    const [result] = await pool.query(
      `
        INSERT INTO annual_plan_images (plan_id, image_url, caption)
        VALUES (?, ?, ?)
      `,
      [req.params.id, req.body.image_url, req.body.caption || null]
    );

    return ok(res, { id: result.insertId }, "Plan image added", 201);
  } catch (error) {
    console.error(error);
    return fail(res, "Server error", 500);
  }
}

export async function deletePlanImage(req, res) {
  try {
    const [result] = await pool.query(
      "DELETE FROM annual_plan_images WHERE id = ?",
      [req.params.imageId]
    );

    if (!result.affectedRows) {
      return fail(res, "Image not found", 404);
    }

    return ok(res, null, "Plan image deleted");
  } catch (error) {
    console.error(error);
    return fail(res, "Server error", 500);
  }
}
