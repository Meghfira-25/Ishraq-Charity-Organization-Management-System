import { useEffect, useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";

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
  content_type: "Program",
  short_description: "",
  description: "",
  image: "",
  event_date: "",
  location: "",
  status: "Draft",
};

export default function Content() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blank);

  async function load() {
    setLoading(true);

    try {
      const data = await api("/content?limit=100");

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

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(blank);
    setOpen(true);
  }

  function startEdit(content) {
    setEditingId(content.id);

    setForm({
      title: content.title || "",
      content_type: content.content_type || "Program",
      short_description: content.short_description || "",
      description: content.description || "",
      image: content.image || "",
      event_date: content.event_date
        ? String(content.event_date).slice(0, 10)
        : "",
      location: content.location || "",
      status: content.status || "Draft",
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
      if (editingId) {
        await api(`/content/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await api("/content", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      closeModal();
      await load();
    } catch (error) {
      setError(error);
    }
  }

  async function toggle(content) {
    try {
      await api(`/content/${content.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status:
            content.status === "Published"
              ? "Draft"
              : "Published",
        }),
      });

      await load();
    } catch (error) {
      setError(error);
    }
  }

  async function remove(id) {
    const confirmed = window.confirm(
      "Delete this public content?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api(`/content/${id}`, {
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
        eyebrow="CMS"
        title="Public Content"
        description="Manage programs, news, events, success stories and their public image URLs."
        action={
          <button
            className="btn btn-gold"
            onClick={startCreate}
          >
            <Plus size={17} />
            New Content
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
                  <th>Title</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map((content) => (
                  <tr key={content.id}>
                    <td>
                      <b>{content.title}</b>

                      <small>
                        {content.short_description || ""}
                      </small>
                    </td>

                    <td>
                      {content.content_type?.replaceAll(
                        "_",
                        " "
                      )}
                    </td>

                    <td>
                      {content.event_date?.slice(0, 10) ||
                        new Date(
                          content.created_at
                        ).toLocaleDateString()}
                    </td>

                    <td>
                      <StatusBadge value={content.status} />
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-soft btn-xs"
                          onClick={() =>
                            startEdit(content)
                          }
                        >
                          <Pencil size={13} />
                          Edit
                        </button>

                        <button
                          className="btn btn-soft btn-xs"
                          onClick={() =>
                            toggle(content)
                          }
                        >
                          {content.status === "Published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>

                        <button
                          className="icon-btn danger-icon"
                          onClick={() =>
                            remove(content.id)
                          }
                          title="Delete content"
                        >
                          <Trash2 size={15} />
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

      <Modal
        open={open}
        title={
          editingId
            ? "Edit public content"
            : "Create public content"
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
              Title

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Content type

              <select
                name="content_type"
                value={form.content_type}
                onChange={handleChange}
              >
                {[
                  "Program",
                  "News",
                  "Event",
                  "Success_Story",
                ].map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Draft">
                  Draft
                </option>

                <option value="Published">
                  Published
                </option>

                <option value="Archived">
                  Archived
                </option>
              </select>
            </label>

            <label>
              Event date

              <input
                type="date"
                name="event_date"
                value={form.event_date}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            Short description

            <input
              name="short_description"
              value={form.short_description}
              onChange={handleChange}
            />
          </label>

          <label>
            Detailed description

            <textarea
              rows="7"
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </label>

          <div className="form-grid">
            <label>
              Location

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </label>

            <label>
              Image URL

              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </label>
          </div>

          {form.image && (
            <div className="cms-image-preview">
              <img
                src={form.image}
                alt="Content preview"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />

              <small>
                Image preview. Paste a direct public
                image URL; you can replace it later
                by editing this content.
              </small>
            </div>
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
                ? "Save Changes"
                : "Create Content"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
