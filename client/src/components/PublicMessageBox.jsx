import { useState } from "react";
import {
  MessageCircle,
  Send,
  X,
} from "lucide-react";

import { api } from "../api/client.js";

const initial = {
  full_name: "",
  email: "",
  subject: "Website message",
  message: "",
};

export default function PublicMessageBox() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [isError, setIsError] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setFeedback("");
    setIsError(false);

    try {
      await api("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setFeedback(
        "Message sent. Ishraq staff can now review it."
      );

      setForm(initial);
    } catch (error) {
      setIsError(true);

      setFeedback(
        error.message ||
          "Unable to send message"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="public-message-widget">
      {open && (
        <section
          className="public-message-panel"
          aria-label="Message Ishraq"
        >
          <div className="public-message-head">
            <div>
              <span className="eyebrow">
                CONTACT ISHRAQ
              </span>

              <h3>Send us a message</h3>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Close message box"
            >
              <X size={17} />
            </button>
          </div>

          <p>
            Ask a question, share an inquiry or contact
            the organization directly. Admin can review
            this message from the management dashboard.
          </p>

          <form onSubmit={submit}>
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
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Message

              <textarea
                name="message"
                rows="4"
                value={form.message}
                onChange={handleChange}
                required
              />
            </label>

            {feedback && (
              <div
                className={`message-widget-feedback ${
                  isError
                    ? "message-widget-error"
                    : ""
                }`}
              >
                {feedback}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-gold btn-block"
              disabled={busy}
            >
              {busy ? (
                "Sending..."
              ) : (
                <>
                  <Send size={15} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </section>
      )}

      <button
        className="public-message-trigger"
        type="button"
        onClick={() =>
          setOpen((value) => !value)
        }
        aria-label={
          open
            ? "Close message box"
            : "Open message box"
        }
      >
        {open ? (
          <X size={23} />
        ) : (
          <MessageCircle size={24} />
        )}

        <span>
          {open ? "Close" : "Message us"}
        </span>
      </button>
    </div>
  );
}

