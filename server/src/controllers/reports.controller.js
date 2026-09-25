
import pool from "../config/db.js";
import {
  ok,
  fail,
} from "../utils/http.js";

export async function summary(req, res) {
  try {
    const [beneficiaries] =
      await pool.query(`
        SELECT
          status,
          COUNT(*) AS count
        FROM beneficiaries
        GROUP BY status
      `);

    const [members] =
      await pool.query(`
        SELECT
          status,
          COUNT(*) AS count
        FROM members
        GROUP BY status
      `);

    const [assistance] =
      await pool.query(`
        SELECT
          status,
          COUNT(*) AS count
        FROM assistance_applications
        GROUP BY status
      `);

    const [donations] =
      await pool.query(`
        SELECT
          donation_type,
          status,
          COUNT(*) AS count,
          COALESCE(
            SUM(amount),
            0
          ) AS amount_total,
          COALESCE(
            SUM(quantity),
            0
          ) AS quantity_total
        FROM donations
        GROUP BY
          donation_type,
          status
      `);

    const [resources] =
      await pool.query(`
        SELECT
          resource_type,
          status,
          COUNT(*) AS count,
          COALESCE(
            SUM(total_quantity),
            0
          ) AS total_quantity,
          COALESCE(
            SUM(available_quantity),
            0
          ) AS available_quantity
        FROM resources
        GROUP BY
          resource_type,
          status
      `);

    const [distributions] =
      await pool.query(`
        SELECT
          DATE_FORMAT(
            distribution_date,
            '%Y-%m'
          ) AS month,
          COUNT(*) AS count,
          COALESCE(
            SUM(quantity),
            0
          ) AS quantity
        FROM distributions
        WHERE status = 'Completed'
        GROUP BY month
        ORDER BY month DESC
        LIMIT 12
      `);

    const [activities] =
      await pool.query(`
        SELECT
          status,
          COUNT(*) AS count
        FROM activities
        GROUP BY status
      `);

    return ok(res, {
      beneficiaries,
      members,
      assistance,
      donations,
      resources,
      distributions,
      activities,
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

export async function beneficiaryReport(
  req,
  res
) {
  try {
    const [rows] =
      await pool.query(`
        SELECT
          status,
          gender,
          city,
          support_type,
          COUNT(*) AS count,
          COALESCE(
            AVG(monthly_income),
            0
          ) AS avg_income
        FROM beneficiaries
        GROUP BY
          status,
          gender,
          city,
          support_type
        ORDER BY count DESC
      `);

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

export async function donationReport(
  req,
  res
) {
  try {
    const [rows] =
      await pool.query(`
        SELECT
          DATE_FORMAT(
            created_at,
            '%Y-%m'
          ) AS month,
          donation_type,
          status,
          COUNT(*) AS count,
          COALESCE(
            SUM(amount),
            0
          ) AS amount_total,
          COALESCE(
            SUM(quantity),
            0
          ) AS quantity_total
        FROM donations
        GROUP BY
          month,
          donation_type,
          status
        ORDER BY month DESC
      `);

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

export async function distributionReport(
  req,
  res
) {
  try {
    const params = [];

    let where =
      "WHERE 1=1";

    if (req.query.from) {
      where +=
        " AND d.distribution_date >= ?";

      params.push(
        req.query.from
      );
    }

    if (req.query.to) {
      where +=
        " AND d.distribution_date <= ?";

      params.push(
        req.query.to
      );
    }

    const [rows] =
      await pool.query(
        `
          SELECT
            d.distribution_date,
            b.full_name AS beneficiary,
            r.resource_name,
            d.quantity,
            d.unit,
            d.status,
            u.full_name AS distributed_by,
            a.title AS activity
          FROM distributions d
          JOIN beneficiaries b
            ON b.id = d.beneficiary_id
          JOIN resources r
            ON r.id = d.resource_id
          JOIN users u
            ON u.id = d.distributed_by
          LEFT JOIN activities a
            ON a.id = d.activity_id
          ${where}
          ORDER BY d.distribution_date DESC
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

