import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/DataState.jsx";

const blank = {
  beneficiary_id: "",
  assistance_application_id: "",
  resource_id: "",
  activity_id: "",
  quantity: "",
  unit: "",
  priority: "Normal",
  distribution_date: new Date().toISOString().slice(0, 10),
  distribution_location: "",
  status: "Completed",
  notes: "",
};

export default function Distributions() {
  const [items, setItems] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [assistance, setAssistance] = useState([]);
  const [resources, setResources] = useState([]);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);

    try {
      const [
        distributionsData,
        beneficiariesData,
        assistanceData,
        resourcesData,
        activitiesData,
      ] = await Promise.all([
        api("/distributions?limit=100"),
        api("/beneficiaries?limit=100&status=Approved"),
        api("/assistance?limit=100&status=Approved"),
        api("/resources?limit=100"),
        api("/activities?limit=100"),
      ]);

      setItems(distributionsData.items || []);
      setBeneficiaries(beneficiariesData.items || []);
      setAssistance(assistanceData.items || []);

      setResources(
        (resourcesData.items || []).filter(
          (resource) =>
            Number(resource.available_quantity) > 0 &&
            resource.status !== "Unavailable"
        )
      );

      setActivities(activitiesData.items || []);

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

  async function create(event) {
    event.preventDefault();

    setMsg("");

    try {
      await api("/distributions", {
        method: "POST",
        body: JSON.stringify({
          ...form,

          beneficiary_id: Number(
            form.beneficiary_id
          ),

          resource_id: Number(
            form.resource_id
          ),

          assistance_application_id:
            form.assistance_application_id
              ? Number(
                  form.assistance_application_id
                )
              : null,

          activity_id: form.activity_id
            ? Number(form.activity_id)
            : null,

          quantity: Number(form.quantity),
        }),
      });

      setForm(blank);
      setOpen(false);

      await load();
    } catch (error) {
      setMsg(error.message);
    }
  }

  const filteredAssistance = assistance.filter(
    (application) =>
      !form.beneficiary_id ||
      String(application.beneficiary_id) ===
        String(form.beneficiary_id)
  );

  return (
    <>
      <PageHeader
        eyebrow="DISTRIBUTION"
        title="Resource Distributions"
        description="Create controlled distributions. The API prevents quantities from exceeding available stock."
        action={
          <button
            className="btn btn-gold"
            onClick={() => {
              setMsg("");
              setOpen(true);
            }}
          >
            <Plus size={17} />
            New Distribution
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
                  <th>Date</th>
                  <th>Beneficiary</th>
                  <th>Resource</th>
                  <th>Quantity</th>
                  <th>Officer</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {items.map((distribution) => (
                  <tr key={distribution.id}>
                    <td>
                      {distribution.distribution_date?.slice(
                        0,
                        10
                      )}
                    </td>

                    <td>
                      <b>
                        {
                          distribution.beneficiary_name
                        }
                      </b>
                    </td>

                    <td>
                      {
                        distribution.resource_name
                      }
                    </td>

                    <td>
                      {distribution.quantity}{" "}
                      {distribution.unit || ""}
                    </td>

                    <td>
                      {
                        distribution.distributed_by_name
                      }
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          distribution.status
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={open}
        title="Create distribution"
        onClose={() => {
          setOpen(false);
          setMsg("");
        }}
        wide
      >
        <form
          className="modal-form"
          onSubmit={create}
        >
          <div className="form-grid">
            <label>
              Beneficiary

              <select
                name="beneficiary_id"
                value={form.beneficiary_id}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select approved beneficiary
                </option>

                {beneficiaries.map(
                  (beneficiary) => (
                    <option
                      key={beneficiary.id}
                      value={beneficiary.id}
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
              Approved assistance

              <select
                name="assistance_application_id"
                value={
                  form.assistance_application_id
                }
                onChange={handleChange}
              >
                <option value="">
                  Optional
                </option>

                {filteredAssistance.map(
                  (application) => (
                    <option
                      key={application.id}
                      value={application.id}
                    >
                      #{application.id} -{" "}
                      {application.support_type?.replaceAll(
                        "_",
                        " "
                      )}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Resource

              <select
                name="resource_id"
                value={form.resource_id}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select resource
                </option>

                {resources.map(
                  (resource) => (
                    <option
                      key={resource.id}
                      value={resource.id}
                    >
                      {
                        resource.resource_name
                      }{" "}
                      (
                      {
                        resource.available_quantity
                      }{" "}
                      {resource.unit || ""}{" "}
                      available)
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              Quantity

              <input
                type="number"
                step="0.01"
                min="0"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Unit

              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
              />
            </label>

            <label>
              Priority

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="Normal">
                  Normal
                </option>

                <option value="Urgent">
                  Urgent
                </option>
              </select>
            </label>

            <label>
              Date

              <input
                type="date"
                name="distribution_date"
                value={
                  form.distribution_date
                }
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Activity

              <select
                name="activity_id"
                value={form.activity_id}
                onChange={handleChange}
              >
                <option value="">
                  No linked activity
                </option>

                {activities.map(
                  (activity) => (
                    <option
                      key={activity.id}
                      value={activity.id}
                    >
                      {activity.title}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>

          <label>
            Location

            <input
              name="distribution_location"
              value={
                form.distribution_location
              }
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

          {msg && (
            <div className="alert alert-error">
              {msg}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setOpen(false);
                setMsg("");
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-gold"
            >
              Complete Distribution
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
