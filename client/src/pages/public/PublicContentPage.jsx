import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Newspaper,
} from "lucide-react";
import { api, qs } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import { EmptyState, LoadingState } from "../../components/DataState.jsx";

const fallback = {
  Program: [
    {
      id: "p1",
      title: "Education Support",
      short_description: "School materials, sponsorship and learning support for children.",
    },
    {
      id: "p2",
      title: "Food Assistance",
      short_description: "Essential food packages for families in urgent need.",
    },
    {
      id: "p3",
      title: "Medical Support",
      short_description: "Health-related assistance for vulnerable beneficiaries.",
    },
  ],
  News: [
    {
      id: "n1",
      title: "Community Support Update",
      short_description: "Ishraq volunteers continue coordinating support for local families.",
      event_date: "2026-09-10",
      image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "n2",
      title: "Volunteer Gathering",
      short_description: "Members gathered to prepare upcoming charity activities.",
      event_date: "2026-09-05",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  Event: [
    {
      id: "e1",
      title: "Community Distribution Day",
      short_description: "A planned distribution activity supporting approved beneficiaries.",
      event_date: "2026-09-22",
      location: "Addis Ababa",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1400&q=80",
    },
    {
      id: "e2",
      title: "Back-to-School Support",
      short_description: "Educational supplies are prepared for students before the new school term.",
      event_date: "2026-09-28",
      location: "Addis Ababa",
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  Success_Story: [
    {
      id: "s1",
      title: "A family moving forward",
      short_description: "Coordinated support helped a household meet urgent needs and plan for stability.",
    },
    {
      id: "s2",
      title: "Education opens a door",
      short_description: "School support helped a young learner continue their education.",
    },
  ],
};

const fallbackImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80";

function formatDate(value) {
  if (!value) return "Date to be announced";
  const raw = String(value).slice(0, 10);
  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function contentImage(item) {
  return item.image_url || item.cover_image || item.image || fallbackImage;
}

export default function PublicContentPage({
  type,
  title,
  eyebrow,
  description,
  combineEvents = false,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        let data = await api(`/content/public${qs({ type })}`);

        if (combineEvents) {
          const events = await api(`/content/public${qs({ type: "Event" })}`);
          data = [...data, ...events].sort((a, b) => {
            const dateA = String(a.event_date || a.created_at || "");
            const dateB = String(b.event_date || b.created_at || "");
            return dateB.localeCompare(dateA);
          });
        }

        if (alive) setItems(data || []);
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [type, combineEvents]);

  const display = useMemo(() => {
    if (items.length) return items;
    return [...(fallback[type] || []), ...(combineEvents ? fallback.Event : [])];
  }, [items, type, combineEvents]);

  if (combineEvents) {
    const featured = display[0];
    const updates = display.slice(1);

    return (
      <main className="events-page">
        <section className="page-hero shell events-page-hero">
          <PageHeader
            showLogo
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
        </section>

        <section className="section shell events-section">
          {loading && items.length === 0 ? (
            <LoadingState />
          ) : display.length === 0 ? (
            <EmptyState text="Published events and news will appear here." />
          ) : (
            <>
              <div className="events-section-heading">
                <div>
                  <span className="eyebrow">FEATURED UPDATE</span>
                  <h2>Latest from Ishraq</h2>
                </div>
                <p>Activities, announcements and community updates presented in a clear chronological record.</p>
              </div>

              {featured && (
                <article className="events-featured">
                  <div className="events-featured-image-wrap">
                    <img src={contentImage(featured)} alt={featured.title} />
                    <span className="events-featured-badge">
                      <Newspaper size={14} />
                      {String(featured.content_type || type).replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="events-featured-copy">
                    <div className="events-date-line">
                      <span><CalendarDays size={16} /> {formatDate(featured.event_date)}</span>
                      {featured.location && (
                        <span><MapPin size={16} /> {featured.location}</span>
                      )}
                    </div>
                    <h2>{featured.title}</h2>
                    <p>{featured.short_description || featured.description || "Learn more about Ishraq’s latest community activity."}</p>
                    <span className="events-read-more">Ishraq update <ArrowRight size={15} /></span>
                  </div>
                </article>
              )}

              {updates.length > 0 && (
                <div className="events-updates-wrap">
                  <div className="events-updates-title">
                    <span className="eyebrow">NEWS & EVENTS ARCHIVE</span>
                    <h2>More updates</h2>
                  </div>

                  <div className="events-list">
                    {updates.map((item, index) => (
                      <article className="events-list-item" key={item.id || index}>
                        <span className="events-list-number">{String(index + 1).padStart(2, "0")}</span>
                        <img src={contentImage(item)} alt={item.title} />
                        <div className="events-list-copy">
                          <div className="events-date-line">
                            <span><CalendarDays size={14} /> {formatDate(item.event_date)}</span>
                            {item.location && <span><MapPin size={14} /> {item.location}</span>}
                          </div>
                          <h3>{item.title}</h3>
                          <p>{item.short_description || item.description || "Published update from Ishraq Charity Organization."}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="page-hero shell">
        <PageHeader eyebrow={eyebrow} title={title} description={description} />
      </section>

      <section className="section shell">
        {loading && items.length === 0 ? (
          <LoadingState />
        ) : display.length === 0 ? (
          <EmptyState text="Published content will appear here." />
        ) : (
          <div className="content-grid">
            {display.map((item, index) => (
              <article className="content-card" key={item.id || index}>
                <div className="public-content-card-image">
                  <img src={contentImage(item)} alt={item.title} />
                </div>

                <div className="content-body">
                  <span className="eyebrow">
                    {String(item.content_type || type).replaceAll("_", " ")}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.short_description || item.description || "Learn more about Ishraq's work and community activities."}</p>

                  {(item.event_date || item.location) && (
                    <div className="meta-row">
                      {item.event_date && <span><CalendarDays size={15} /> {formatDate(item.event_date)}</span>}
                      {item.location && <span><MapPin size={15} /> {item.location}</span>}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
