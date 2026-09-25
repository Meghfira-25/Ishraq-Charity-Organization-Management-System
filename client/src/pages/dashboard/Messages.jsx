import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { api, qs } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { EmptyState, ErrorState, LoadingState } from "../../components/DataState.jsx";


export default function Messages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);

    try {
      const data = await api(
        `/contact${qs({
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

  async function mark(id, newStatus) {
    try {
      await api(`/contact/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      await load();
    } catch (error) {
      setError(error);
    }
  }

  async function remove(id) {
    const confirmed = window.confirm(
      "Delete this public message permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api(`/contact/${id}`, {
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
        eyebrow="PUBLIC INBOX"
        title="Contact Messages"
        description="Review, resolve or remove messages submitted from the public website."
      />

      <div className="filters">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All messages</option>
          <option value="New">New</option>
          <option value="Read">Read</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {error && <ErrorState error={error} />}

      <section className="panel">
        {loading ? (
          <LoadingState />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="message-list">
            {items.map((message) => (
              <article
                className="message-card"
                key={message.id}
              >
                <div className="message-head">
                  <div>
                    <b>{message.full_name}</b>

                    <span>
                      {message.email}

                      {message.phone_number
                        ? ` • ${message.phone_number}`
                        : ""}
                    </span>
                  </div>

                  <StatusBadge value={message.status} />
                </div>

                <h4>
                  {message.subject || "General inquiry"}
                </h4>

                <p>{message.message}</p>

                <div className="message-actions">
                  <small>
                    {new Date(
                      message.created_at
                    ).toLocaleString()}
                  </small>

                  <div>
                    {message.status === "New" && (
                      <button
                        className="btn btn-soft btn-xs"
                        onClick={() =>
                          mark(message.id, "Read")
                        }
                      >
                        Mark Read
                      </button>
                    )}

                    {message.status !== "Resolved" && (
                      <button
                        className="btn btn-success btn-xs"
                        onClick={() =>
                          mark(message.id, "Resolved")
                        }
                      >
                        Resolve
                      </button>
                    )}

                    <button
                      className="btn btn-danger btn-xs"
                      onClick={() =>
                        remove(message.id)
                      }
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}


