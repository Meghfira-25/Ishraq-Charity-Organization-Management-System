import pool from "../config/db.js";
import {
  ok,
  fail,
} from "../utils/http.js";

import { pagination } from "../utils/query.js";

import {
  positiveNumber,
  required,
} from "../utils/validation.js";

export async function createDistribution(req, res) {
  let connection;

  try {
    const missing = required(
      req.body,
      [
        "beneficiary_id",
        "resource_id",
        "quantity",
        "distribution_date",
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

    if (!positiveNumber(req.body.quantity)) {
      return fail(
        res,
        "Quantity must be greater than zero",
        400
      );
    }

    connection =
      await pool.getConnection();

    await connection.beginTransaction();

    const [beneficiaryRows] =
      await connection.query(
        `
          SELECT
            id,
            status
          FROM beneficiaries
          WHERE id = ?
          FOR UPDATE
        `,
        [req.body.beneficiary_id]
      );

    if (
      !beneficiaryRows.length ||
      beneficiaryRows[0].status !==
        "Approved"
    ) {
      await connection.rollback();

      return fail(
        res,
        "Only approved beneficiaries can receive distributions",
        400
      );
    }

    if (
      req.body.assistance_application_id
    ) {
      const [applicationRows] =
        await connection.query(
          `
            SELECT
              id,
              status,
              beneficiary_id
            FROM assistance_applications
            WHERE id = ?
            FOR UPDATE
          `,
          [
            req.body
              .assistance_application_id,
          ]
        );

      if (!applicationRows.length) {
        await connection.rollback();

        return fail(
          res,
          "Assistance application not found",
          404
        );
      }

      const application =
        applicationRows[0];

      if (
        Number(
          application.beneficiary_id
        ) !==
        Number(
          req.body.beneficiary_id
        )
      ) {
        await connection.rollback();

        return fail(
          res,
          "Assistance application does not belong to this beneficiary",
          400
        );
      }

      if (
        application.status !==
        "Approved"
      ) {
        await connection.rollback();

        return fail(
          res,
          "Assistance application must be approved",
          400
        );
      }
    }

    const [resourceRows] =
      await connection.query(
        `
          SELECT *
          FROM resources
          WHERE id = ?
          FOR UPDATE
        `,
        [req.body.resource_id]
      );

    if (!resourceRows.length) {
      await connection.rollback();

      return fail(
        res,
        "Resource not found",
        404
      );
    }

    const resource =
      resourceRows[0];

    const quantity =
      Number(req.body.quantity);

    if (
      resource.status ===
        "Unavailable" ||
      Number(
        resource.available_quantity
      ) < quantity
    ) {
      await connection.rollback();

      return fail(
        res,
        `Insufficient resource quantity. Available: ${resource.available_quantity}`,
        400
      );
    }

    const distributionStatus =
      req.body.status ||
      "Completed";

    const [result] =
      await connection.query(
        `
          INSERT INTO distributions (
            beneficiary_id,
            assistance_application_id,
            resource_id,
            activity_id,
            quantity,
            unit,
            priority,
            distribution_date,
            distribution_location,
            distributed_by,
            notes,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.body.beneficiary_id,

          req.body
            .assistance_application_id ||
            null,

          req.body.resource_id,

          req.body.activity_id ||
            null,

          quantity,

          req.body.unit ||
            resource.unit,

          req.body.priority ||
            "Normal",

          req.body
            .distribution_date,

          req.body
            .distribution_location ||
            null,

          req.user.id,

          req.body.notes ||
            null,

          distributionStatus,
        ]
      );

    if (
      distributionStatus ===
      "Completed"
    ) {
      const remaining =
        Number(
          resource.available_quantity
        ) - quantity;

      const resourceStatus =
        remaining <= 0
          ? "Fully_Distributed"
          : remaining <
              Number(
                resource.total_quantity
              )
            ? "Partially_Distributed"
            : "Available";

      await connection.query(
        `
          UPDATE resources
          SET
            available_quantity = ?,
            status = ?
          WHERE id = ?
        `,
        [
          remaining,
          resourceStatus,
          resource.id,
        ]
      );

      if (
        req.body
          .assistance_application_id
      ) {
        await connection.query(
          `
            UPDATE assistance_applications
            SET status = 'Completed'
            WHERE id = ?
          `,
          [
            req.body
              .assistance_application_id,
          ]
        );
      }
    }

    await connection.commit();

    return ok(
      res,
      {
        id: result.insertId,
      },
      "Distribution created successfully",
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

export async function listDistributions(
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

    let where =
      "WHERE 1=1";

    if (
      req.query.beneficiary_id
    ) {
      where +=
        " AND d.beneficiary_id = ?";

      params.push(
        req.query.beneficiary_id
      );
    }

    if (req.query.resource_id) {
      where +=
        " AND d.resource_id = ?";

      params.push(
        req.query.resource_id
      );
    }

    if (req.query.status) {
      where +=
        " AND d.status = ?";

      params.push(
        req.query.status
      );
    }

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

    const [countRows] =
      await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM distributions d
          ${where}
        `,
        params
      );

    const [rows] =
      await pool.query(
        `
          SELECT
            d.*,
            b.full_name AS beneficiary_name,
            r.resource_name,
            u.full_name AS distributed_by_name,
            a.title AS activity_title
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
          ORDER BY
            d.distribution_date DESC,
            d.created_at DESC
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

export async function getDistribution(
  req,
  res
) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT
            d.*,
            b.full_name AS beneficiary_name,
            r.resource_name,
            u.full_name AS distributed_by_name,
            a.title AS activity_title
          FROM distributions d
          JOIN beneficiaries b
            ON b.id = d.beneficiary_id
          JOIN resources r
            ON r.id = d.resource_id
          JOIN users u
            ON u.id = d.distributed_by
          LEFT JOIN activities a
            ON a.id = d.activity_id
          WHERE d.id = ?
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Distribution not found",
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

