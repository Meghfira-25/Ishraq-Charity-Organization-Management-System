import { useEffect, useState } from "react";

import {
  Activity,
  Boxes,
  ClipboardList,
  HandCoins,
  HeartHandshake,
  Truck,
  Users,
} from "lucide-react";

import { api } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import {
  ErrorState,
  LoadingState,
} from "../../components/DataState.jsx";

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const result = await api("/dashboard");

        setData(result);
        setError(null);
      } catch (error) {
        setError(error);
      }
    }

    loadDashboard();
  }, []);

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data) {
    return <LoadingState />;
  }

  const stats = data.stats || {};

  const cards = [
    [
      HeartHandshake,
      "Beneficiaries",
      stats.beneficiaries?.total || 0,
      `${stats.beneficiaries?.pending || 0} pending`,
    ],
    [
      Users,
      "Members",
      stats.members?.total || 0,
      `${stats.members?.pending || 0} pending`,
    ],
    [
      ClipboardList,
      "Assistance",
      stats.assistance?.total || 0,
      `${stats.assistance?.pending || 0} pending`,
    ],
    [
      HandCoins,
      "Donations",
      stats.donations?.total || 0,
      `${stats.donations?.pending || 0} pending`,
    ],
    [
      Boxes,
      "Resources",
      stats.resources?.total || 0,
      `${stats.resources?.available_quantity || 0} available`,
    ],
    [
      Truck,
      "Distributions",
      stats.distributions?.total || 0,
      "completed / planned",
    ],
    [
      Activity,
      "Activities",
      stats.activities?.total || 0,
      `${stats.activities?.active || 0} active`,
    ],
  ];

  return (
    <>
      <PageHeader
        eyebrow="OVERVIEW"
        title="Dashboard"
        description="Live operational view of Ishraq's charity management system."
      />

      <div className="stat-grid dash-stat-grid">
        {cards.map(
          ([Icon, label, value, sub]) => (
            <div
              className="dash-stat"
              key={label}
            >
              <div className="dash-stat-icon">
                <Icon size={20} />
              </div>

              <span>{label}</span>

              <strong>{value}</strong>

              <small>{sub}</small>
            </div>
          )
        )}
      </div>

      <div className="dash-panels">
        <section className="panel">
          <div className="panel-head">
            <h3>
              Recent assistance applications
            </h3>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Beneficiary</th>
                  <th>Support</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {(
                  data.recent?.applications || []
                ).map((application) => (
                  <tr key={application.id}>
                    <td>
                      {
                        application.beneficiary_name
                      }
                    </td>

                    <td>
                      {application.support_type?.replaceAll(
                        "_",
                        " "
                      )}
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          application.status
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>Recent donations</h3>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Donor / Item</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {(
                  data.recent?.donations || []
                ).map((donation) => (
                  <tr key={donation.id}>
                    <td>
                      {donation.is_anonymous
                        ? "Anonymous"
                        : donation.full_name ||
                          donation.item_name ||
                          "Donation"}
                    </td>

                    <td>
                      {donation.donation_type}
                    </td>

                    <td>
                      <StatusBadge
                        value={donation.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

