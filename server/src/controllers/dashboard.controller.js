import pool from "../config/db.js";
import {
  ok,
  fail,
} from "../utils/http.js";

export async function dashboard(req, res) {
  try {
    const [
      [beneficiaryStats],
      [memberStats],
      [assistanceStats],
      [donationStats],
      [resourceStats],
      [distributionStats],
      [activityStats],
      [staffStats],
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) AS total,
          SUM(status = 'Pending') AS pending
        FROM beneficiaries
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total,
          SUM(status = 'Pending') AS pending
        FROM members
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total,
          SUM(status = 'Pending') AS pending
        FROM assistance_applications
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total,
          SUM(status = 'Pending') AS pending,
          COALESCE(SUM(amount), 0) AS money_total
        FROM donations
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total,
          COALESCE(
            SUM(available_quantity),
            0
          ) AS available_quantity
        FROM resources
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total
        FROM distributions
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total,
          SUM(
            status IN (
              'Planned',
              'Upcoming',
              'Ongoing'
            )
          ) AS active
        FROM activities
      `),

      pool.query(`
        SELECT
          COUNT(*) AS total
        FROM users
        WHERE status = 'Active'
      `),
    ]);

    const [recentApplications] =
      await pool.query(`
        SELECT
          a.id,
          b.full_name AS beneficiary_name,
          a.support_type,
          a.status,
          a.created_at
        FROM assistance_applications a
        JOIN beneficiaries b
          ON b.id = a.beneficiary_id
        ORDER BY a.created_at DESC
        LIMIT 5
      `);

    const [recentDonations] =
      await pool.query(`
        SELECT
          id,
          donation_type,
          full_name,
          is_anonymous,
          amount,
          item_name,
          quantity,
          status,
          created_at
        FROM donations
        ORDER BY created_at DESC
        LIMIT 5
      `);

    const [recentDistributions] =
      await pool.query(`
        SELECT
          d.id,
          b.full_name AS beneficiary_name,
          r.resource_name,
          d.quantity,
          d.unit,
          d.distribution_date
        FROM distributions d
        JOIN beneficiaries b
          ON b.id = d.beneficiary_id
        JOIN resources r
          ON r.id = d.resource_id
        ORDER BY d.created_at DESC
        LIMIT 5
      `);

    return ok(res, {
      stats: {
        beneficiaries:
          beneficiaryStats[0],

        members:
          memberStats[0],

        assistance:
          assistanceStats[0],

        donations:
          donationStats[0],

        resources:
          resourceStats[0],

        distributions:
          distributionStats[0],

        activities:
          activityStats[0],

        active_staff:
          staffStats[0].total,
      },

      recent: {
        applications:
          recentApplications,

        donations:
          recentDonations,

        distributions:
          recentDistributions,
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

