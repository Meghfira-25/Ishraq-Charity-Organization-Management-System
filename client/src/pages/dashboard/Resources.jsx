import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api, qs } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/DataState.jsx";

const blank={resource_name:"",resource_type:"Food",total_quantity:"",unit:"",description:"",received_date:""};

export default function Resources() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);

    try {
      const data = await api(
        `/resources${qs({
          limit: 100,
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

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function create(e) {
    e.preventDefault();

    try {
      await api("/resources", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          total_quantity: Number(form.total_quantity),
        }),
      });

      setForm(blank);
      setOpen(false);
      await load();
    } catch (error) {
      setError(error);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="INVENTORY"
        title="Resources"
        description="Track total and available quantities for verified charitable resources."
        action={
          <button
            className="btn btn-gold"
            onClick={() => setOpen(true)}
          >
            <Plus size={17} />
            Add Resource
          </button>
        }
      />

      <div className="filters">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>

          {[
            "Available",
            "Partially_Distributed",
            "Fully_Distributed",
            "Unavailable",
          ].map((item) => (
            <option key={item} value={item}>
              {item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorState error={error} />}

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
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {items.map((resource) => {
                  const total = Number(
                    resource.total_quantity || 0
                  );

                  const available = Number(
                    resource.available_quantity || 0
                  );

                  const percentage = total
                    ? Math.max(
                        0,
                        Math.min(
                          100,
                          (available / total) * 100
                        )
                      )
                    : 0;

                  return (
                    <tr key={resource.id}>
                      <td>
                        <b>{resource.resource_name}</b>

                        <small>
                          {resource.description || ""}
                        </small>
                      </td>

                      <td>
                        {resource.resource_type}
                      </td>

                      <td>
                        {total} {resource.unit || ""}
                      </td>

                      <td>
                        {available} {resource.unit || ""}
                      </td>

                      <td>
                        <div className="progress">
                          <span
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td>
                        <StatusBadge
                          value={resource.status}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={open}
        title="Add resource"
        onClose={() => setOpen(false)}
      >
        <form
          className="modal-form"
          onSubmit={create}
        >
          <label>
            Resource name
            <input
              name="resource_name"
              value={form.resource_name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Type
            <select
              name="resource_type"
              value={form.resource_type}
              onChange={handleChange}
            >
              {[
                "Money",
                "Food",
                "Clothing",
                "Textbooks",
                "Other",
              ].map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </label>

          <div className="form-grid">
            <label>
              Total quantity
              <input
                type="number"
                min="0"
                name="total_quantity"
                value={form.total_quantity}
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
          </div>

          <label>
            Received date
            <input
              type="date"
              name="received_date"
              value={form.received_date}
              onChange={handleChange}
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-gold"
            >
              Add Resource
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

