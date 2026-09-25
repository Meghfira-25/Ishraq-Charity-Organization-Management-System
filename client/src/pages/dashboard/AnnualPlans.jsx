import { useEffect, useState } from "react";
import {
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { api } from "../../api/client.js";
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
  year: new Date().getFullYear(),
  short_description: "",
  description: "",
  status: "Planned",
  start_date: "",
  end_date: "",
  target_value: 0,
  current_value: 0,
  target_unit: "",
  beneficiaries: 0,
  cover_image: "",
  result_summary: "",
  is_published: false,
};

export default function AnnualPlans() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);

  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoPlan, setPhotoPlan] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoForm, setPhotoForm] = useState({ image_url: "", caption: "" });

  async function load() {
    setLoading(true);
    try {
      const data = await api("/annual-plans?limit=100");
      setItems(data.items || []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(blank);
    setOpen(true);
  }

  function startEdit(plan) {
    setEditingId(plan.id);
    setForm({
      title: plan.title || "",
      year: plan.year || new Date().getFullYear(),
      short_description: plan.short_description || "",
      description: plan.description || "",
      status: plan.status || "Planned",
      start_date: plan.start_date ? String(plan.start_date).slice(0, 10) : "",
      end_date: plan.end_date ? String(plan.end_date).slice(0, 10) : "",
      target_value: plan.target_value ?? 0,
      current_value: plan.current_value ?? 0,
      target_unit: plan.target_unit || "",
      beneficiaries: plan.beneficiaries ?? 0,
      cover_image: plan.cover_image || "",
      result_summary: plan.result_summary || "",
      is_published: Boolean(plan.is_published),
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
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        target_value: Number(form.target_value || 0),
        current_value: Number(form.current_value || 0),
        beneficiaries: Number(form.beneficiaries || 0),
      };

      if (editingId) {
        await api(`/annual-plans/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/annual-plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      closeModal();
      await load();
    } catch (err) {
      setError(err);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this annual plan and its photos?")) return;

    try {
      await api(`/annual-plans/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err);
    }
  }

  async function togglePublished(plan) {
    try {
      await api(`/annual-plans/${plan.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_published: !plan.is_published }),
      });
      await load();
    } catch (err) {
      setError(err);
    }
  }

  async function openPhotos(plan) {
    try {
      const data = await api(`/annual-plans/${plan.id}`);
      setPhotoPlan(data);
      setPhotos(data.images || []);
      setPhotoForm({ image_url: "", caption: "" });
      setPhotoOpen(true);
    } catch (err) {
      setError(err);
    }
  }

  async function addPhoto(event) {
    event.preventDefault();
    if (!photoPlan) return;

    try {
      await api(`/annual-plans/${photoPlan.id}/images`, {
        method: "POST",
        body: JSON.stringify(photoForm),
      });
      await openPhotos(photoPlan);
    } catch (err) {
      setError(err);
    }
  }

  async function removePhoto(imageId) {
    try {
      await api(`/annual-plans/images/${imageId}`, { method: "DELETE" });
      await openPhotos(photoPlan);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="ANNUAL PLANS"
        title="Yearly Initiatives"
        description="Publish Ishraq's yearly commitments, track progress, record results and attach activity photos."
        action={
          <button className="btn btn-gold" onClick={startCreate}>
            <Plus size={17} /> New Annual Plan
          </button>
        }
      />

      {error && <ErrorState error={error} />}

      <section className="panel">
        {loading ? (
          <LoadingState />
        ) : items.length === 0 ? (
          <EmptyState text="No annual plans yet." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Public</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((plan) => {
                  const progress = Number(plan.target_value)
                    ? Math.min(100, Math.round((Number(plan.current_value || 0) / Number(plan.target_value)) * 100))
                    : 0;

                  return (
                    <tr key={plan.id}>
                      <td>
                        <b>{plan.title}</b>
                        <small>{plan.short_description || plan.target_unit || ""}</small>
                      </td>
                      <td>{plan.year}</td>
                      <td><StatusBadge value={plan.status} /></td>
                      <td>
                        {progress}%
                        <small>
                          {Number(plan.current_value || 0).toLocaleString()} / {Number(plan.target_value || 0).toLocaleString()} {plan.target_unit || ""}
                        </small>
                      </td>
                      <td>{plan.is_published ? "Published" : "Hidden"}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn btn-soft btn-xs" onClick={() => startEdit(plan)}>
                            <Pencil size={13} /> Edit
                          </button>
                          <button className="btn btn-soft btn-xs" onClick={() => openPhotos(plan)}>
                            <ImagePlus size={13} /> Photos
                          </button>
                          <button className="btn btn-soft btn-xs" onClick={() => togglePublished(plan)}>
                            {plan.is_published ? "Hide" : "Publish"}
                          </button>
                          <button className="icon-btn danger-icon" onClick={() => remove(plan.id)} title="Delete plan">
                            <Trash2 size={15} />
                          </button>
                        </div>
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
        title={editingId ? "Edit annual plan" : "Create annual plan"}
        onClose={closeModal}
        wide
      >
        <form className="modal-form" onSubmit={save}>
          <div className="form-grid">
            <label>
              Plan title
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>
            <label>
              Year
              <input type="number" min="2000" name="year" value={form.year} onChange={handleChange} required />
            </label>
            <label>
              Status
              <select name="status" value={form.status} onChange={handleChange}>
                {['Planned', 'Upcoming', 'Ongoing', 'Completed'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="is_published" checked={form.is_published} onChange={handleChange} />
              Publish on website
            </label>
          </div>

          <label>
            Short description
            <input name="short_description" value={form.short_description} onChange={handleChange} />
          </label>

          <label>
            Detailed description
            <textarea rows="6" name="description" value={form.description} onChange={handleChange} />
          </label>

          <div className="form-grid">
            <label>
              Start date
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
            </label>
            <label>
              End date
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
            </label>
            <label>
              Target
              <input type="number" min="0" name="target_value" value={form.target_value} onChange={handleChange} />
            </label>
            <label>
              Current progress
              <input type="number" min="0" name="current_value" value={form.current_value} onChange={handleChange} />
            </label>
            <label>
              Target unit
              <input name="target_unit" value={form.target_unit} onChange={handleChange} placeholder="exercise books, mothers, families..." />
            </label>
            <label>
              Beneficiaries
              <input type="number" min="0" name="beneficiaries" value={form.beneficiaries} onChange={handleChange} />
            </label>
          </div>

          <label>
            Cover image URL
            <input type="url" name="cover_image" value={form.cover_image} onChange={handleChange} placeholder="https://..." />
          </label>

          <label>
            Result summary
            <textarea rows="4" name="result_summary" value={form.result_summary} onChange={handleChange} placeholder="Add final results when the plan is completed." />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-gold">
              {editingId ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={photoOpen}
        title={photoPlan ? `Photos — ${photoPlan.title}` : "Plan Photos"}
        onClose={() => setPhotoOpen(false)}
        wide
      >
        <form className="modal-form" onSubmit={addPhoto}>
          <div className="form-grid">
            <label>
              Image URL
              <input
                type="url"
                value={photoForm.image_url}
                onChange={(event) => setPhotoForm((prev) => ({ ...prev, image_url: event.target.value }))}
                required
              />
            </label>
            <label>
              Caption
              <input
                value={photoForm.caption}
                onChange={(event) => setPhotoForm((prev) => ({ ...prev, caption: event.target.value }))}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn btn-gold"><Plus size={15} /> Add Photo</button>
          </div>
        </form>

        {photos.length > 0 && (
          <div className="annual-plan-admin-photos">
            {photos.map((photo) => (
              <div key={photo.id}>
                <img src={photo.image_url} alt={photo.caption || "Annual plan"} />
                <span>{photo.caption || "Activity photo"}</span>
                <button className="icon-btn danger-icon" onClick={() => removePhoto(photo.id)} title="Delete photo">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
