import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Target,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api/client.js";
import Logo from "../../components/Logo.jsx";


const fallbackPlans = {
  "exercise-books": {
    id: "exercise-books",
    title: "Exercise Book Donation 2026",
    status: "Ongoing",
    short_description: "Collecting and distributing exercise books for sponsored students during the academic year.",
    description: "This initiative supports sponsored students with the exercise books they need for the school year. Ishraq tracks collection progress and documents distribution as the plan is implemented.",
    start_date: "2026-08-01",
    end_date: "2026-09-30",
    target_value: 2000,
    current_value: 1450,
    target_unit: "exercise books",
    beneficiaries: 430,
    cover_image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    images: [],
  },
  "mothers-workshop": {
    id: "mothers-workshop",
    title: "Mothers Job Creation Initiative",
    status: "Upcoming",
    short_description: "A practical workshop and income-generation initiative designed to support mothers toward sustainable livelihoods.",
    description: "The initiative is planned to provide practical training and income-generation opportunities for mothers, with progress and outcomes recorded throughout implementation.",
    start_date: "2026-10-01",
    end_date: "2026-12-15",
    target_value: 60,
    current_value: 0,
    target_unit: "mothers",
    beneficiaries: 60,
    cover_image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80",
    images: [],
  },
  "family-support": {
    id: "family-support",
    title: "Seasonal Family Support",
    status: "Planned",
    short_description: "Coordinated essential support for vulnerable households during high-need periods of the year.",
    description: "This planned initiative will coordinate essential assistance for vulnerable households and record the beneficiaries, resources and outcomes once implementation begins.",
    target_value: 250,
    current_value: 0,
    target_unit: "families",
    beneficiaries: 250,
    cover_image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
    images: [],
  },
};

function progressOf(plan) {
  const target = Number(plan?.target_value) || 0;
  const current = Number(plan?.current_value) || 0;
  return target ? Math.min(100, Math.round((current / target) * 100)) : 0;
}

export default function AnnualPlanDetail() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    api(`/annual-plans/public/${id}`)
      .then((data) => {
        if (alive) setPlan(data);
      })
      .catch(() => {
        if (!alive) return;
        if (fallbackPlans[id]) {
          setPlan(fallbackPlans[id]);
          setError("");
        } else {
          setError("This annual plan is not available yet.");
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const progress = useMemo(() => progressOf(plan), [plan]);

  if (loading) {
    return <main className="section shell"><p>Loading annual plan...</p></main>;
  }

  if (!plan || error) {
    return (
      <main className="section shell annual-plan-empty">
        <p>{error || "Annual plan not found."}</p>
        <Link to="/annual-plans" className="text-link">
          <ArrowLeft size={16} /> Back to Annual Plans
        </Link>
      </main>
    );
  }

  return (
    <main className="annual-plan-detail-page">
      <section className="annual-plan-detail-hero">
        <div className="shell annual-plan-detail-hero-inner">
          <div>
            <div className="annual-plan-detail-brand">
              <Logo />
              <span>Annual implementation document</span>
            </div>

            <Link to="/annual-plans" className="annual-plan-back">
              <ArrowLeft size={15} /> Annual Plans
            </Link>

            <span className={`annual-plan-status status-${String(plan.status).toLowerCase()}`}>
              {plan.status}
            </span>

            <h1>{plan.title}</h1>
            <p>{plan.short_description || plan.description}</p>
          </div>

          {plan.cover_image && (
            <img src={plan.cover_image} alt={plan.title} className="annual-plan-detail-cover" />
          )}
        </div>
      </section>

      <section className="section shell annual-plan-detail-content">
        <div className="annual-plan-detail-main">
          <span className="eyebrow">ABOUT THE INITIATIVE</span>
          <h2>Purpose and implementation</h2>
          <p>{plan.description || plan.short_description}</p>

          {plan.result_summary && (
            <div className="annual-plan-result">
              <CheckCircle2 size={22} />
              <div>
                <strong>Result summary</strong>
                <p>{plan.result_summary}</p>
              </div>
            </div>
          )}

          {plan.images?.length > 0 && (
            <div className="annual-plan-gallery-section">
              <span className="eyebrow">ACTIVITY PHOTOS</span>
              <h2>Documented progress</h2>

              <div className="annual-plan-gallery">
                {plan.images.map((image) => (
                  <figure key={image.id}>
                    <img src={image.image_url} alt={image.caption || plan.title} />
                    {image.caption && <figcaption>{image.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="annual-plan-facts">
          <div>
            <Target size={18} />
            <span>Target</span>
            <strong>
              {Number(plan.target_value || 0).toLocaleString()} {plan.target_unit || ""}
            </strong>
          </div>

          <div>
            <Users size={18} />
            <span>Beneficiaries</span>
            <strong>{Number(plan.beneficiaries || 0).toLocaleString()}</strong>
          </div>

          <div>
            <CalendarDays size={18} />
            <span>Duration</span>
            <strong>
              {plan.start_date ? String(plan.start_date).slice(0, 10) : "TBA"}
              {plan.end_date ? ` – ${String(plan.end_date).slice(0, 10)}` : ""}
            </strong>
          </div>

          {Number(plan.target_value) > 0 && (
            <div className="annual-plan-facts-progress">
              <span>Progress</span>
              <strong>{progress}%</strong>
              <div className="annual-plan-progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
