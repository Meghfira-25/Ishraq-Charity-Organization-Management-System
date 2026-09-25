import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api, qs } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/DataState.jsx";

export default function Members() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);

    try {
      const data = await api(
        `/members${qs({
          limit: 100,
          search,
          status,
        })}`
      );

      setItems(data.items || []);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  async function review(id, newStatus) {
    const reviewNotes =
      window.prompt(`Notes for ${newStatus}:`) || "";

    try {
      await api(`/members/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          review_notes: reviewNotes,
        }),
      });

      await load();
    } catch (error) {
      setError(error);
    }
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
      load();
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="MEMBERSHIP"
        title="Membership Applications"
        description="Review public membership applications and maintain approved member records."
      />

      <div className="filters">
        <div className="search-box">
          <Search size={17} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search applicant"
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="">
            All statuses
          </option>

          {[
            "Pending",
            "Approved",
            "Rejected",
            "More_Info",
          ].map((item) => (
            <option
              key={item}
              value={item}
            >
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        <button
          className="btn btn-soft"
          onClick={load}
        >
          Search
        </button>
      </div>

      {error && (
        <ErrorState error={error} />
      )}

      <section className="panel">
        {loading ? (
          <LoadingState />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Review</th>
                </tr>
              </thead>

              <tbody>
                {items.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <b>
                        {member.full_name}
                      </b>

                      <small>
                        {member.education_level
                          ?.replaceAll(
                            "_",
                            " "
                          )}
                      </small>
                    </td>

                    <td>
                      {member.email}

                      <small>
                        {member.phone_number ||
                          ""}
                      </small>
                    </td>

                    <td>
                      {[
                        member.city,
                        member.subcity,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>

                    <td>
                      <StatusBadge
                        value={member.status}
                      />
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-success btn-xs"
                          onClick={() =>
                            review(
                              member.id,
                              "Approved"
                            )
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="btn btn-soft btn-xs"
                          onClick={() =>
                            review(
                              member.id,
                              "More_Info"
                            )
                          }
                        >
                          More Info
                        </button>

                        <button
                          className="btn btn-danger btn-xs"
                          onClick={() =>
                            review(
                              member.id,
                              "Rejected"
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

