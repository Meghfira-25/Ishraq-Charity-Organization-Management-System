import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/DataState.jsx";

const blank = { full_name: "", email: "", phone_number: "", password: "", role: "Registration-Officer" };

export default function Staff() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);

    try {
      const data = await api("/staff?limit=100");

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
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function create(e) {
    e.preventDefault();
    setMsg("");

    try {
      await api("/staff", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm(blank);
      setOpen(false);
      await load();
    } catch (error) {
      setMsg(error.message);
    }
  }

  async function toggle(staff) {
    try {
      await api(`/staff/${staff.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: staff.status === "Active" ? "Inactive" : "Active",
        }),
      });

      await load();
    } catch (error) {
      setError(error);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="Staff Management"
        description="Create and manage authorized Ishraq staff accounts."
        action={
          <button
            className="btn btn-gold"
            onClick={() => {
              setMsg("");
              setOpen(true);
            }}
          >
            <Plus size={17} />
            Add Staff
          </button>
        }
      />

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
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {items.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <b>{staff.full_name}</b>
                      <small>{staff.phone_number || ""}</small>
                    </td>

                    <td>{staff.email}</td>

                    <td>
                      {staff.role
                        ? staff.role.replaceAll("-", " ")
                        : ""}
                    </td>

                    <td>
                      <StatusBadge value={staff.status} />
                    </td>

                    <td>
                      <button
                        className="btn btn-soft btn-xs"
                        onClick={() => toggle(staff)}
                      >
                        {staff.status === "Active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
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
        title="Create staff account"
        onClose={() => {
          setOpen(false);
          setMsg("");
        }}
      >
        <form className="modal-form" onSubmit={create}>
          <label>
            Full name
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Phone
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
            />
          </label>

          <label>
            Role
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="Registration-Officer">
                Registration Officer
              </option>

              <option value="Distribution-Officer">
                Distribution Officer
              </option>
            </select>
          </label>

          <label>
            Temporary password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
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
              Create Staff
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

