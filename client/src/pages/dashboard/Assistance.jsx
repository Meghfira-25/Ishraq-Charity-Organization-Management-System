import { useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { api, qs } from "../../api/client.js";
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
  beneficiary_id: "",
  support_type: "Food",
  requested_amount: "",
  description: "",
  urgency_level: "Urgent",
};

export default function Assistance() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(blank);
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);

    try {
      const [applicationsData, beneficiariesData] =
        await Promise.all([
          api(
            `/assistance${qs({
              limit: 100,
              status,
            })}`
          ),
          api(
            "/beneficiaries?limit=100&status=Approved"
          ),
        ]);

      setItems(applicationsData.items || []);
      setBeneficiaries(
        beneficiariesData.items || []
      );

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

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const canEdit = [
    "Admin",
    "Registration-Officer",
  ].includes(user?.role);

  function startCreate() {
    setEditingId(null);
    setForm(blank);
    setOpen(true);
  }

  function startEdit(application) {
    setEditingId(application.id);

    setForm({
      beneficiary_id: String(
        application.beneficiary_id || ""
      ),

      support_type:
        application.support_type || "Food",

      requested_amount:
        application.requested_amount ?? "",

      description:
        application.description || "",

      urgency_level:
        application.urgency_level || "Urgent",
    });

    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingId(null);
    setForm(blank);
  }

  async function save(event) {
    event.preventDefault();

    const body = {
      ...form,

      beneficiary_id: Number(
        form.beneficiary_id
      ),

      requested_amount:
        form.requested_amount !== ""
          ? Number(form.requested_amount)
          : null,
    };

    try {
      if (editingId) {
        const {
          beneficiary_id,
          ...updateBody
        } = body;

        await api(
          `/assistance/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(
              updateBody
            ),
          }
        );
      } else {
        await api("/assistance", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      closeModal();
      await load();
    } catch (error) {
      setError(error);
    }
  }

  async function review(
    id,
    newStatus
  ) {
    const reviewNotes =
      window.prompt(
        `Notes for ${newStatus}:`
      ) || "";

    try {
      await api(
        `/assistance/${id}/review`,
        {
          method: "PATCH",

          body: JSON.stringify({
            status: newStatus,
            review_notes:
              reviewNotes,
          }),
        }
      );

      await load();
    } catch (error) {
      setError(error);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="CASE MANAGEMENT"
        title="Assistance Applications"
        description="Registration Officers can create and edit beneficiary assistance applications, respond to More Info requests and resubmit them for Admin review."
        action={
          canEdit ? (
            <button
              className="btn btn-gold"
              onClick={startCreate}
            >
              <Plus size={17} />
              New Application
            </button>
          ) : null
        }
      />

      <div className="filters">
        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
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
            "Completed",
          ].map((item) => (
            <option
              key={item}
              value={item}
            >
              {item.replaceAll(
                "_",
                " "
              )}
            </option>
          ))}
        </select>
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
                  <th>Beneficiary</th>
                  <th>Support</th>
                  <th>Urgency</th>
                  <th>Requested</th>
                  <th>Status</th>

                  {canEdit && (
                    <th>Edit</th>
                  )}

                  {user?.role ===
                    "Admin" && (
                    <th>Review</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (application) => (
                    <tr
                      key={
                        application.id
                      }
                    >
                      <td>
                        <b>
                          {
                            application.beneficiary_name
                          }
                        </b>

                        <small>
                          {new Date(
                            application.created_at
                          ).toLocaleDateString()}
                        </small>

                        {application.review_notes && (
                          <small>
                            Review note:{" "}
                            {
                              application.review_notes
                            }
                          </small>
                        )}
                      </td>

                      <td>
                        {application.support_type?.replaceAll(
                          "_",
                          " "
                        )}
                      </td>

                      <td>
                        {application.urgency_level?.replaceAll(
                          "_",
                          " "
                        )}
                      </td>

                      <td>
                        {application.requested_amount
                          ? `${Number(
                              application.requested_amount
                            ).toLocaleString()} ETB`
                          : "—"}
                      </td>

                      <td>
                        <StatusBadge
                          value={
                            application.status
                          }
                        />
                      </td>

                      {canEdit && (
                        <td>
                          <button
                            className="btn btn-soft btn-xs"
                            onClick={() =>
                              startEdit(
                                application
                              )
                            }
                          >
                            <Pencil
                              size={13}
                            />
                            Edit
                          </button>
                        </td>
                      )}

                      {user?.role ===
                        "Admin" && (
                        <td>
                          <div className="row-actions">
                            <button
                              className="btn btn-success btn-xs"
                              onClick={() =>
                                review(
                                  application.id,
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
                                  application.id,
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
                                  application.id,
                                  "Rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </div>
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
        title={
          editingId
            ? "Edit assistance application"
            : "New assistance application"
        }
        onClose={closeModal}
        wide
      >
        <form
          className="modal-form"
          onSubmit={save}
        >
          <div className="form-grid">
            <label>
              Beneficiary

              <select
                name="beneficiary_id"
                value={
                  form.beneficiary_id
                }
                onChange={handleChange}
                required
                disabled={
                  Boolean(editingId)
                }
              >
                <option value="">
                  Select approved
                  beneficiary
                </option>

                {beneficiaries.map(
                  (beneficiary) => (
                    <option
                      value={
                        beneficiary.id
                      }
                      key={
                        beneficiary.id
                      }
                    >
                      {
                        beneficiary.full_name
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Support type

              <select
                name="support_type"
                value={
                  form.support_type
                }
                onChange={handleChange}
              >
                {[
                  "Food",
                  "Children_Education",
                  "Money",
                  "Job_creation",
                  "House_rent",
                  "Medical",
                  "Other",
                ].map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type.replaceAll(
                      "_",
                      " "
                    )}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Requested amount

              <input
                type="number"
                min="0"
                name="requested_amount"
                value={
                  form.requested_amount
                }
                onChange={handleChange}
              />
            </label>

            <label>
              Urgency

              <select
                name="urgency_level"
                value={
                  form.urgency_level
                }
                onChange={handleChange}
              >
                <option value="Urgent">
                  Urgent
                </option>

                <option value="Very_Urgent">
                  Very Urgent
                </option>
              </select>
            </label>
          </div>

          <label>
            Description

            <textarea
              name="description"
              rows="5"
              value={
                form.description
              }
              onChange={handleChange}
              required
            />
          </label>

          {editingId && (
            <p className="form-help">
              Saving an edit
              resubmits the
              application as{" "}
              <strong>
                Pending
              </strong>{" "}
              so the Admin can
              review the updated
              information again.
            </p>
          )}

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
              {editingId
                ? "Save & Resubmit"
                : "Create Application"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

