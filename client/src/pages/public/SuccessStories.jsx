import { useEffect, useState } from "react";
import {ArrowRight, Quote,} from "lucide-react";
import { Link } from "react-router-dom";
import { api, qs,} from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import { publicImages } from "../../config/publicImages.js";

const fallback = [
  {
    id: "s1",
    title: "A family moving forward",
    short_description:
      "Coordinated assistance helped a household address urgent needs and create room to focus on longer-term stability.",
  },
  {
    id: "s2",
    title: "Education opens a door",
    short_description:
      "Learning support helped a student continue school with the materials and encouragement needed to keep progressing.",
  },
  {
    id: "s3",
    title: "Support delivered with dignity",
    short_description:
      "A carefully organized distribution connected available resources with approved beneficiaries while protecting private information.",
  },
];

export default function SuccessStories() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;

    api(
      `/content/public${qs({
        type: "Success_Story",
      })}`
    )
      .then((data) => {
        if (alive) {
          setItems(data || []);
        }
      })
      .catch(() => {
        if (alive) {
          setItems([]);
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  const display =
    items.length > 0
      ? items
      : fallback;

  return (
    <main className="editorial-page">
      <section className="page-hero shell">
        <PageHeader
          eyebrow="SUCCESS STORIES"
          title="Impact is more than a number."
          description="These stories communicate the human meaning behind organized support while keeping sensitive beneficiary information private."
        />
      </section>

      <section className="section shell story-intro">
        <Quote size={36} />

        <p>
          Every successful activity begins with
          a need, moves through responsible
          decisions and becomes meaningful when
          support reaches people with dignity.
        </p>
      </section>

      <section className="story-editorial-list shell">
        {display.map(
          (item, index) => {
            const fallbackImage =
              publicImages.stories[
                index %
                  publicImages.stories.length
              ];

            return (
              <article
                className="story-editorial-row story-editorial-row-with-image"
                key={
                  item.id ||
                  item.title
                }
              >
                <div className="story-index">
                  {String(
                    index + 1
                  ).padStart(
                    2,
                    "0"
                  )}
                </div>

                <div className="story-copy">
                  <span className="eyebrow">
                    COMMUNITY IMPACT
                  </span>

                  <h2>
                    {item.title}
                  </h2>

                  <p>
                    {item.short_description ||
                      item.description ||
                      "A published Ishraq story about community support and impact."}
                  </p>
                </div>

                <img
                  className="story-image"
                  src={
                    item.image ||
                    fallbackImage
                  }
                  alt={
                    item.title ||
                    "Ishraq success story"
                  }
                  loading="lazy"
                />
              </article>
            );
          }
        )}
      </section>

      <section className="editorial-band story-closing">
        <div className="shell editorial-split">
          <div>
            <span className="eyebrow">
              KEEP THE STORY GOING
            </span>

            <h2>
              Your support can become the next
              meaningful outcome.
            </h2>
          </div>

          <div className="editorial-prose">
            <p>
              Donate resources, support Ishraq
              programs or join the organization
              as a member. Every contribution
              can strengthen the system that
              turns generosity into organized
              assistance.
            </p>

            <Link
              className="text-link"
              to="/donate"
            >
              Make a donation
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

