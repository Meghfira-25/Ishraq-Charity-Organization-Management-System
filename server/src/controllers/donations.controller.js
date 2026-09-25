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

export async function createDonation(req, res) {
  try {
    const missing = required(
      req.body,
      ["donation_type"]
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

    const donationType =
      req.body.donation_type;

    const allowedTypes = [
      "Money",
      "Food",
      "Clothing",
      "Textbooks",
      "Other",
    ];

    if (
      !allowedTypes.includes(
        donationType
      )
    ) {
      return fail(
        res,
        "Invalid donation type",
        400
      );
    }

    if (
      donationType === "Money" &&
      !positiveNumber(req.body.amount)
    ) {
      return fail(
        res,
        "A positive amount is required for money donations",
        400
      );
    }

    if (
      donationType !== "Money" &&
      (
        !req.body.item_name ||
        !positiveNumber(
          req.body.quantity
        )
      )
    ) {
      return fail(
        res,
        "Item name and positive quantity are required for physical donations",
        400
      );
    }

    const isAnonymous =
      Boolean(
        req.body.is_anonymous
      );

    const [result] =
      await pool.query(
        `
          INSERT INTO donations (
            is_anonymous,
            full_name,
            phone_number,
            email,
            address,
            donation_type,
            amount,
            item_name,
            quantity,
            unit,
            purpose,
            donation_description,
            preferred_date,
            preferred_time,
            payment_screenshot,
            notes
          )
          VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?
          )
        `,
        [
          isAnonymous,

          isAnonymous
            ? null
            : req.body.full_name ||
              null,

          isAnonymous
            ? null
            : req.body.phone_number ||
              null,

          isAnonymous
            ? null
            : req.body.email ||
              null,

          req.body.address || null,

          donationType,

          req.body.amount || null,

          req.body.item_name || null,

          req.body.quantity || null,

          req.body.unit || null,

          req.body.purpose || null,

          req.body
            .donation_description ||
            null,

          req.body.preferred_date ||
            null,

          req.body.preferred_time ||
            null,

          req.body
            .payment_screenshot ||
            null,

          req.body.notes || null,
        ]
      );

    return ok(
      res,
      {
        id: result.insertId,
        status: "Pending",
      },
      "Donation information submitted successfully",
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

export async function listDonations(req, res) {
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
        " AND d.status = ?";

      params.push(
        req.query.status
      );
    }

    if (
      req.query.donation_type
    ) {
      where +=
        " AND d.donation_type = ?";

      params.push(
        req.query.donation_type
      );
    }

    if (req.query.search) {
      where += `
        AND (
          d.full_name LIKE ?
          OR d.email LIKE ?
          OR d.item_name LIKE ?
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

    const [countRows] =
      await pool.query(
        `
          SELECT COUNT(*) AS total
          FROM donations d
          ${where}
        `,
        params
      );

    const [rows] =
      await pool.query(
        `
          SELECT
            d.*,
            u.full_name AS reviewed_by_name
          FROM donations d
          LEFT JOIN users u
            ON u.id = d.reviewed_by
          ${where}
          ORDER BY d.created_at DESC
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

export async function getDonation(req, res) {
  try {
    const [rows] =
      await pool.query(
        `
          SELECT
            d.*,
            u.full_name AS reviewed_by_name
          FROM donations d
          LEFT JOIN users u
            ON u.id = d.reviewed_by
          WHERE d.id = ?
        `,
        [req.params.id]
      );

    if (!rows.length) {
      return fail(
        res,
        "Donation not found",
        404
      );
    }

    const [resources] =
      await pool.query(
        `
          SELECT *
          FROM resources
          WHERE donation_id = ?
        `,
        [req.params.id]
      );

    return ok(res, {
      ...rows[0],
      resources,
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

export async function reviewDonation(req, res) {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Confirmed",
      "Received",
      "Rejected",
      "Cancelled",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return fail(
        res,
        "Invalid donation status",
        400
      );
    }

    const [result] =
      await pool.query(
        `
          UPDATE donations
          SET
            status = ?,
            reviewed_by = ?,
            reviewed_at = NOW(),
            notes = COALESCE(?, notes)
          WHERE id = ?
        `,
        [
          status,
          req.user.id,
          req.body.notes || null,
          req.params.id,
        ]
      );

    if (!result.affectedRows) {
      return fail(
        res,
        "Donation not found",
        404
      );
    }

    return ok(
      res,
      null,
      `Donation marked ${status}`
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

export async function convertDonationToResource(
  req,
  res
) {
  let connection;

  try {
    connection =
      await pool.getConnection();

    await connection.beginTransaction();

    const [donationRows] =
      await connection.query(
        `
          SELECT *
          FROM donations
          WHERE id = ?
          FOR UPDATE
        `,
        [req.params.id]
      );

    if (!donationRows.length) {
      await connection.rollback();

      return fail(
        res,
        "Donation not found",
        404
      );
    }

    const donation =
      donationRows[0];

    if (
      ![
        "Confirmed",
        "Received",
      ].includes(donation.status)
    ) {
      await connection.rollback();

      return fail(
        res,
        "Donation must be confirmed or received before creating a resource",
        400
      );
    }

    const [existingResources] =
      await connection.query(
        `
          SELECT id
          FROM resources
          WHERE donation_id = ?
        `,
        [donation.id]
      );

    if (
      existingResources.length
    ) {
      await connection.rollback();

      return fail(
        res,
        "A resource already exists for this donation",
        409
      );
    }

    const resourceName =
      req.body.resource_name ||
      donation.item_name ||
      (
        donation.donation_type ===
        "Money"
          ? "Monetary Donation"
          : "Donated Resource"
      );

    const quantity = Number(
      req.body.total_quantity ??
        donation.quantity ??
        donation.amount
    );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      await connection.rollback();

      return fail(
        res,
        "A positive resource quantity is required",
        400
      );
    }

    const unit =
      req.body.unit ||
      donation.unit ||
      (
        donation.donation_type ===
        "Money"
          ? "ETB"
          : null
      );

    const receivedDate =
      req.body.received_date ||
      new Date()
        .toISOString()
        .slice(0, 10);

    const [result] =
      await connection.query(
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
          donation.id,
          resourceName,
          donation.donation_type,
          quantity,
          quantity,
          unit,

          req.body.description ||
            donation
              .donation_description ||
            null,

          receivedDate,

          "Available",

          req.user.id,
        ]
      );

    await connection.query(
      `
        UPDATE donations
        SET
          status = 'Received',
          reviewed_by = ?,
          reviewed_at = NOW()
        WHERE id = ?
      `,
      [
        req.user.id,
        donation.id,
      ]
    );

    await connection.commit();

    return ok(
      res,
      {
        resource_id:
          result.insertId,
      },
      "Donation converted to resource successfully",
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

