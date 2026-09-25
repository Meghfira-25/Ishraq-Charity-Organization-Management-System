import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/DataState.jsx";

const blank = {
  title: "",
  activity_type: "Distribution",
  description: "",
  target_beneficiaries: "",
  location: "",
  start_date: "",
  end_date: "",
  status: "Planned",
  responsible_staff_id: "",
  notes: "",
};

export default function Activities() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);

  async function load() {
    setLoading(true);

    try {
      const activitiesData = await api(
        "/activities?limit=100"
      );

      setItems(activitiesData.items || []);

      if (user?.role === "Admin") {
        try {
          const staffData = await api(
            "/staff?limit=100&status=Active"
          );

          setStaff(staffData.items || []);
        } catch {
          setStaff([]);
        }
      }

      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function closeModal() {
    setOpen(false);
    setForm(blank);
  }

  async function create(event) {
    event.preventDefault();

    try {
      await api("/activities", {
        method: "POST",

        body: JSON.stringify({
          ...form,

          responsible_staff_id:
            form.responsible_staff_id
              ? Number(
                  form.responsible_staff_id
                )
              : null,
        }),
      });

      closeModal();
      await load();
    } catch (error) {
      setError(error);
    }
  }

  async function remove(id) {
    const confirmed = window.confirm(
      "Delete this activity?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api(`/activities/${id}`, {
        method: "DELETE",
      });

      await load();
    } catch (error) {
      setError(error);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="ACTIVITIES"
        title="Charity Activities"
        description="Plan and track programs, events and distribution activities."
        action={
          <button
            className="btn btn-gold"
            onClick={() => setOpen(true)}
          >
            <Plus size={17} />
            New Activity
          </button>
        }
      />

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
                  <th>Activity</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Responsible</th>
                  <th>Status</th>

                  {user?.role ===
                    "Admin" && (
                    <th>Action</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (activity) => (
                    <tr
                      key={activity.id}
                    >
                      <td>
                        <b>
                          {activity.title}
                        </b>

                        <small>
                          {activity.description ||
                            ""}
                        </small>
                      </td>

                      <td>
                        {activity.activity_type}
                      </td>

                      <td>
                        {activity.start_date?.slice(
                          0,
                          10
                        )}
                      </td>

                      <td>
                        {activity.location ||
                          "—"}
                      </td>

                      <td>
                        {activity.responsible_staff_name ||
                          "—"}
                      </td>

                      <td>
                        <StatusBadge
                          value={
                            activity.status
                          }
                        />
                      </td>

                      {user?.role ===
                        "Admin" && (
                        <td>
                          <button
                            className="icon-btn danger-icon"
                            onClick={() =>
                              remove(
                                activity.id
                              )
                            }
                            title="Delete activity"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={open}
        title="Create charity activity"
        onClose={closeModal}
        wide
      >
        <form
          className="modal-form"
          onSubmit={create}
        >
          <div className="form-grid">
            <label>
              Title

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Type

              <select
                name="activity_type"
                value={
                  form.activity_type
                }
                onChange={handleChange}
              >
                <option value="Program">
                  Program
                </option>

                <option value="Event">
                  Event
                </option>

                <option value="Distribution">
                  Distribution
                </option>
              </select>
            </label>

            <label>
              Start date

              <input
                type="date"
                name="start_date"
                value={form.start_date}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              End date

              <input
                type="date"
                name="end_date"
                value={form.end_date}
                onChange={handleChange}
              />
            </label>

            <label>
              Status

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {[
                  "Planned",
                  "Upcoming",
                  "Ongoing",
                  "Completed",
                  "Cancelled",
                ].map((statusValue) => (
                  <option
                    key={statusValue}
                    value={statusValue}
                  >
                    {statusValue}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Responsible staff

              <select
                name="responsible_staff_id"
                value={
                  form.responsible_staff_id
                }
                onChange={handleChange}
              >
                <option value="">
                  Not assigned
                </option>

                {staff.map(
                  (staffMember) => (
                    <option
                      key={
                        staffMember.id
                      }
                      value={
                        staffMember.id
                      }
                    >
                      {
                        staffMember.full_name
                      }
                    </option>
                  )
                )}
              </select>
            </label>
          </div>

          <label>
            Location

            <input
              name="location"
              value={form.location}
              onChange={handleChange}
            />
          </label>

          <label>
            Target beneficiaries

            <input
              name="target_beneficiaries"
              value={
                form.target_beneficiaries
              }
              onChange={handleChange}
            />
          </label>

          <label>
            Description

            <textarea
              rows="4"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <label>
            Notes

            <textarea
              rows="3"
              name="notes"
              value={form.notes}
              onChange={handleChange}
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={closeModal}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-gold"
            >
              Create Activity
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

