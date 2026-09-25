import pool from "../config/db.js";
import {
  ok,
  fail,
} from "../utils/http.js";

import { pagination } from "../utils/query.js";
import { positiveNumber } from "../utils/validation.js";

export async function listResources(req, res) {
  try {
    const {
      page,
      limit,
      offset,
    } = pagination(req.query);

    const params = [];

    let where =
      "WHERE 1=1";

    if (req.query.status) {
      where +=
        " AND r.status = ?";

      params.push(
        req.query.status
      );
    }

    if (
      req.query.resource_type
    ) {
      where +=
        " AND r.resource_type = ?";

      params.push(
        req.query.resource_type
      );
    }

    if (req.query.search) {
      where +=
        " AND r.resource_name LIKE ?";

      params.push(
        `%${req.query.search}%`
      );
    }

    const [countRows] =
      await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM resources r
          ${where}
        `,
        params
      );

    const [rows] =
      await pool.query(
        `
          SELECT
            r.*,
            u.full_name AS created_by_name
          FROM resources r
          JOIN users u
            ON u.id = r.created_by
          ${where}
          ORDER BY r.created_at DESC
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

export async function getResource(req, res) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT
            r.*,
            u.full_name AS created_by_name
          FROM resources r
          JOIN users u
            ON u.id = r.created_by
          WHERE r.id = ?
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Resource not found",
        404
      );
    }

    const [distributions] =
      await pool.query(
        `
          SELECT
            d.*,
            b.full_name AS beneficiary_name
          FROM distributions d
          JOIN beneficiaries b
            ON b.id = d.beneficiary_id
          WHERE d.resource_id = ?
          ORDER BY d.distribution_date DESC
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

export async function createResource(req, res) {
  try {
    if (
      !req.body.resource_name ||
      !req.body.resource_type ||
      !positiveNumber(
        req.body.total_quantity
      )
    ) {
      return fail(
        res,
        "resource_name, resource_type and a positive total_quantity are required",
        400
      );
    }

    if (req.body.donation_id) {
      const [donationRows] =
        await pool.query(
          `
            SELECT status
            FROM donations
            WHERE id = ?
          `,
          [req.body.donation_id]
        );

      if (!donationRows.length) {
        return fail(
          res,
          "Donation not found",
          404
        );
      }

      if (
        ![
          "Confirmed",
          "Received",
        ].includes(
          donationRows[0].status
        )
      ) {
        return fail(
          res,
          "Resource can only be created from a verified donation",
          400
        );
      }
    }

    const quantity =
      Number(
        req.body.total_quantity
      );

    const [result] =
      await pool.query(
        `
          INSERT INTO resources (
            donation_id,
            resource_name,
            resource_type,
            total_quantity,
            available_quantity,
            unit,
            description,
            received_date,
            status,
            created_by
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.body.donation_id ||
            null,

          req.body.resource_name,

          req.body.resource_type,

          quantity,

          quantity,

          req.body.unit || null,

          req.body.description ||
            null,

          req.body.received_date ||
            null,

          "Available",

          req.user.id,
        ]
      );

    return ok(
      res,
      {
        id: result.insertId,
      },
      "Resource created successfully",
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

export async function updateResource(req, res) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT *
          FROM resources
          WHERE id = ?
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Resource not found",
        404
      );
    }

    const current =
      rows[0];

    const total =
      req.body.total_quantity !==
      undefined
        ? Number(
            req.body.total_quantity
          )
        : Number(
            current.total_quantity
          );

    const available =
      req.body.available_quantity !==
      undefined
        ? Number(
            req.body
              .available_quantity
          )
        : Number(
            current
              .available_quantity
          );

    if (
      total < 0 ||
      available < 0 ||
      available > total
    ) {
      return fail(
        res,
        "Invalid resource quantities",
        400
      );
    }

    let status =
      req.body.status ||
      current.status;

    if (available === 0) {
      status =
        "Fully_Distributed";
    } else if (
      available < total
    ) {
      status =
        "Partially_Distributed";
    } else if (
      status !== "Unavailable"
    ) {
      status =
        "Available";
    }

    await pool.query(
      `
        UPDATE resources
        SET
          resource_name = ?,
          resource_type = ?,
          total_quantity = ?,
          available_quantity = ?,
          unit = ?,
          description = ?,
          received_date = ?,
          status = ?
        WHERE id = ?
      `,
      [
        req.body.resource_name ??
          current.resource_name,

        req.body.resource_type ??
          current.resource_type,

        total,

        available,

        req.body.unit ??
          current.unit,

        req.body.description ??
          current.description,

        req.body.received_date ??
          current.received_date,

        status,

        req.params.id,
      ]
    );

    return ok(
      res,
      null,
      "Resource updated successfully"
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

