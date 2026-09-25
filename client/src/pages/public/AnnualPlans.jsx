import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Target,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";

const fallback = [
  {
    id: "exercise-books",
    title: "Exercise Book Donation 2026",
    year: 2026,
    short_description:
      "Collecting and distributing exercise books for sponsored students during the academic year.",
    status: "Ongoing",
    start_date: "2026-08-01",
    end_date: "2026-09-30",
    target_value: 2000,
    current_value: 1450,
    target_unit: "exercise books",
    beneficiaries: 430,
    cover_image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "mothers-workshop",
    title: "Mothers Job Creation Initiative",
    year: 2026,
    short_description:
      "A practical workshop and income-generation initiative designed to support mothers toward sustainable livelihoods.",
    status: "Upcoming",
    start_date: "2026-10-01",
    end_date: "2026-12-15",
    target_value: 60,
    current_value: 0,
    target_unit: "mothers",
    beneficiaries: 60,
    cover_image:
      "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "family-support",
    title: "Seasonal Family Support",
    year: 2026,
    short_description:
      "Coordinated essential support for vulnerable households during high-need periods of the year.",
    status: "Planned",
    target_value: 250,
    current_value: 0,
    target_unit: "families",
    beneficiaries: 250,
    cover_image:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
  },
];

const statusIcon = {
  Planned: Target,
  Upcoming: CalendarDays,
  Ongoing: Clock3,
  Completed: CheckCircle2,
};

function progressOf(plan) {
  const target = Number(plan.target_value) || 0;
  const current = Number(plan.current_value) || 0;

  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

export default function AnnualPlans() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    api("/annual-plans/public")
      .then((data) => {
        if (alive) setItems(data || []);
      })
      .catch(() => {
        if (alive) setItems([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const display = useMemo(
    () => (items.length ? items : fallback),
    [items]
  );

  const year = display[0]?.year || new Date().getFullYear();

  return (
    <main className="annual-plans-page">
      <section className="page-hero shell">
        <PageHeader
          showLogo
          eyebrow={`${year} ANNUAL PLAN`}
          title="This year’s commitments, documented with clear progress."
          description="A structured annual-plan record of Ishraq’s major initiatives, targets, implementation periods, beneficiaries and measurable progress throughout the year."
        />
      </section>

      <section className="section shell annual-plan-list-section">
        <div className="annual-plan-intro">
          <span className="annual-plan-document-label">ANNUAL IMPLEMENTATION RECORD</span>
          <p>
            Each plan below is presented as a documented commitment: what Ishraq intends to deliver, who it serves, the implementation period, the measurable target and the progress recorded so far.
          </p>
        </div>

        <div className="annual-plan-grid">
          {display.map((plan, index) => {
            const StatusIcon = statusIcon[plan.status] || Target;
            const progress = progressOf(plan);

            return (
              <article className="annual-plan-card" key={plan.id || plan.title}>
                <div className="annual-plan-image-wrap">
                  <img
                    src={plan.cover_image || fallback[index % fallback.length].cover_image}
                    alt={plan.title}
                    className="annual-plan-image"
                  />

                  <span className={`annual-plan-status status-${String(plan.status || "Planned").toLowerCase()}`}>
                    <StatusIcon size={14} />
                    {plan.status || "Planned"}
                  </span>
                </div>

                <div className="annual-plan-card-body">
                  <span className="annual-plan-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h2>{plan.title}</h2>
                  <p>{plan.short_description || plan.description}</p>

                  <div className="annual-plan-meta">
                    {(plan.start_date || plan.end_date) && (
                      <span>
                        <CalendarDays size={15} />
                        {plan.start_date ? String(plan.start_date).slice(0, 10) : "TBA"}
                        {plan.end_date ? ` – ${String(plan.end_date).slice(0, 10)}` : ""}
                      </span>
                    )}

                    {Number(plan.beneficiaries) > 0 && (
                      <span>
                        <Users size={15} />
                        {plan.beneficiaries} beneficiaries
                      </span>
                    )}
                  </div>

                  {Number(plan.target_value) > 0 && (
                    <div className="annual-plan-progress-block">
                      <div className="annual-plan-progress-head">
                        <span>Progress</span>
                        <strong>{progress}%</strong>
                      </div>

                      <div className="annual-plan-progress-track">
                        <span style={{ width: `${progress}%` }} />
                      </div>

                      <small>
                        {Number(plan.current_value || 0).toLocaleString()} / {Number(plan.target_value).toLocaleString()} {plan.target_unit || "target"}
                      </small>
                    </div>
                  )}

                  <Link to={`/annual-plans/${plan.id}`} className="annual-plan-link">
                    View plan
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {loading && items.length === 0 && (
          <p className="annual-plan-fallback-note">
            Showing sample annual plans until published plans are added from the admin dashboard.
          </p>
        )}
      </section>
    </main>
  );
}
