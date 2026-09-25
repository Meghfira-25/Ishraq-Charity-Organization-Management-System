import { useState } from "react";
import { api } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";

const initial = {
  full_name: "",
  gender: "Female",
  email: "",
  phone_number: "",
  nationality: "Ethiopian",
  birth_date: "",
  marriage_status: "Single",
  education_level: "Secondary",
  assigned_responsibility: "",
  city: "",
  subcity: "",
  woreda: "",
  kebele: "",
};

export default function Membership() {
  const [form, setForm] = useState(initial);
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
      await api("/members/apply", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setMsg(
        "Membership application submitted successfully. It is now pending review."
      );

      setForm(initial);
    } catch (error) {
      setMsg(
        error.message ||
          "Unable to submit membership application."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <section className="page-hero shell">
        <PageHeader
          eyebrow="BECOME A MEMBER"
          title="Join people who choose to serve."
          description="Submit your membership application and Ishraq administrators will review it."
        />
      </section>

      <section className="section shell narrow">
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
              Gender

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="Female">
                  Female
                </option>

                <option value="Male">
                  Male
                </option>
              </select>
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
              Nationality

              <input
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
              />
            </label>

            <label>
              Birth date

              <input
                type="date"
                name="birth_date"
                value={form.birth_date}
                onChange={handleChange}
              />
            </label>

            <label>
              Marital status

              <select
                name="marriage_status"
                value={form.marriage_status}
                onChange={handleChange}
              >
                <option value="Single">
                  Single
                </option>

                <option value="Married">
                  Married
                </option>

                <option value="Divorced">
                  Divorced
                </option>

                <option value="Widowed">
                  Widowed
                </option>
              </select>
            </label>

            <label>
              Education

              <select
                name="education_level"
                value={form.education_level}
                onChange={handleChange}
              >
                {[
                  "Not_Educated",
                  "Primary",
                  "Secondary",
                  "Degree",
                  "Masters",
                  "PHD",
                  "Other",
                ].map((level) => (
                  <option
                    key={level}
                    value={level}
                  >
                    {level.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label>
              City

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
              />
            </label>

            <label>
              Subcity

              <input
                name="subcity"
                value={form.subcity}
                onChange={handleChange}
              />
            </label>

            <label>
              Woreda

              <input
                name="woreda"
                value={form.woreda}
                onChange={handleChange}
              />
            </label>

            <label>
              Kebele

              <input
                name="kebele"
                value={form.kebele}
                onChange={handleChange}
              />
            </label>
          </div>

          <label>
            Preferred responsibility

            <input
              name="assigned_responsibility"
              value={
                form.assigned_responsibility
              }
              onChange={handleChange}
              placeholder="Volunteer, fundraising, field activity..."
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
              ? "Submitting..."
              : "Submit Application"}
          </button>
        </form>
      </section>
    </main>
  );
}

