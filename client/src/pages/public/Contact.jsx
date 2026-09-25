import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { api } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";

export default function Contact() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    subject: "",
    message: "",
  });

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

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
    setMsg("");

    try {
      await api("/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setMsg("Message sent successfully.");

      setForm({
        full_name: "",
        email: "",
        phone_number: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setMsg(
        error.message ||
          "Unable to send message."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <section className="page-hero shell">
        <PageHeader
          eyebrow="CONTACT"
          title="We'd love to hear from you."
          description="Questions, partnerships, volunteering or general inquiries — send Ishraq a message."
        />
      </section>

      <section className="section shell contact-layout">
        <div className="contact-info">
          <div>
            <Mail />

            <span>
              <b>Email</b>
              info@ishraq.org
            </span>
          </div>

          <div>
            <Phone />

            <span>
              <b>Phone</b>
              +251 900 000 000
            </span>
          </div>

          <div>
            <MapPin />

            <span>
              <b>Location</b>
              Addis Ababa, Ethiopia
            </span>
          </div>
        </div>

        <form
          className="form-card"
          onSubmit={submit}
        >
          <div className="form-grid">
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
              Phone

              <input
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
              />
            </label>

            <label>
              Subject

              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            Message

            <textarea
              name="message"
              rows="6"
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>

          {msg && (
            <div className="alert">
              {msg}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-gold"
            disabled={busy}
          >
            {busy
              ? "Sending..."
              : "Send Message"}
          </button>
        </form>
      </section>
    </main>
  );
}
