import { useEffect, useState } from "react";
import { Eye, PackagePlus } from "lucide-react";
import { api, qs } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/DataState.jsx";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const API_ORIGIN = API_BASE.startsWith("http") ? API_BASE.replace(/\/api\/?$/, "") : "";

export default function Donations() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    try {
      const d = await api(`/donations${qs({ limit: 100, status })}`);
      setItems(d.items || []);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status]);

  async function review(id, newStatus) {
    await api(`/donations/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  async function convert(x) {
    const resource_name = prompt(
      "Resource name:",
      x.item_name || (x.donation_type === "Money" ? "Monetary Donation" : "Donated Resource")
    );
    if (!resource_name) return;
    try {
      await api(`/donations/${x.id}/create-resource`, {
        method: "POST",
        body: JSON.stringify({ resource_name }),
      });
      load();
      alert("Resource created successfully.");
    } catch (e) {
      alert(e.message);
    }
  }

  async function viewProof(path) {
    if (!path) return;
    const previewWindow = window.open("", "_blank");
    try {
      const token = localStorage.getItem("ishraq_token");
      const response = await fetch(`${API_ORIGIN}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Unable to open payment proof");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      if (previewWindow) previewWindow.location.href = url;
      else window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      if (previewWindow) previewWindow.close();
      alert(e.message);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="DONATIONS"
        title="Donation Management"
        description="Verify donation information, review bank-transfer proof and convert confirmed donations into trackable resources."
      />

      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {["Pending", "Confirmed", "Received", "Rejected", "Cancelled"].map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>

      {error && <ErrorState error={error} />}

      <section className="panel">
        {loading ? <LoadingState /> : items.length === 0 ? <EmptyState /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Donation</th>
                  <th>Value / Qty</th>
                  <th>Payment proof</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <b>{x.is_anonymous ? "Anonymous" : x.full_name || "Not provided"}</b>
                      <small>{x.email || x.phone_number || ""}</small>
                    </td>
                    <td>{x.donation_type}<small>{x.item_name || x.purpose || ""}</small></td>
                    <td>{x.donation_type === "Money" ? `${Number(x.amount || 0).toLocaleString()} ETB` : `${x.quantity || 0} ${x.unit || ""}`}</td>
                    <td>
                      {x.payment_screenshot ? (
                        <button className="btn btn-soft btn-xs" onClick={() => viewProof(x.payment_screenshot)}>
                          <Eye size={14} /> View proof
                        </button>
                      ) : <span className="muted">—</span>}
                    </td>
                    <td><StatusBadge value={x.status} /></td>
                    <td>
                      <div className="row-actions">
                        {user.role === "Admin" && x.status === "Pending" && (
                          <>
                            <button className="btn btn-success btn-xs" onClick={() => review(x.id, "Confirmed")}>Confirm</button>
                            <button className="btn btn-danger btn-xs" onClick={() => review(x.id, "Rejected")}>Reject</button>
                          </>
                        )}
                        {["Confirmed", "Received"].includes(x.status) && (
                          <button className="btn btn-soft btn-xs" onClick={() => convert(x)}>
                            <PackagePlus size={14} /> Create Resource
                          </button>
                        )}
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
