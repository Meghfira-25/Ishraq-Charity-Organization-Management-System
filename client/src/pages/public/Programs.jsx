import {
  Activity,
  ArrowRight,
  BookOpen,
  HeartPulse,
  Home,
  Package,
  ShieldCheck,
} from "lucide-react";

import { useEffect, useMemo, useState,} from "react";
import { Link } from "react-router-dom";
import { api, qs } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import { publicImages } from "../../config/publicImages.js";

const fallback = [
  {
    id: "p1",
    title: "Education Support",

    short_description:
      "Helping children and young people continue learning with practical educational support.",

    description:
      "The Education Support Program responds to barriers that can prevent students from staying in school. Depending on verified needs and available resources, Ishraq can coordinate school materials, textbooks, education-related assistance and other forms of learning support. Assistance is connected to an approved beneficiary record so the organization can keep a clear history of what support was requested and delivered.",

    image: publicImages.programs.education,
    icon: BookOpen,

    focus: [
      "School supplies, textbooks and learning materials",
      "Education-related assistance based on approved needs",
      "Support linked to beneficiary and assistance history",
    ],

    who:
      "Children and young people from registered beneficiary households whose education is affected by financial or family hardship.",

    process:
      "A Registration Officer records the beneficiary and assistance need, Admin reviews the case, and approved support is connected to available donations or resources.",
  },

  {
    id: "p2",
    title: "Food & Essential Needs",

    short_description:
      "Organized food and household assistance for families facing urgent day-to-day needs.",

    description:
      "This program connects donated food, clothing and essential household resources with approved beneficiaries. Every physical donation can become a tracked resource, and Distribution Officers record how much is given out. The system prevents distribution above the available quantity, helping Ishraq maintain accountable inventory and distribution records.",

    image: publicImages.programs.food,
    icon: Package,

    focus: [
      "Food packages and staple items",
      "Clothing and essential household goods",
      "Recorded distributions connected to beneficiaries and activities",
    ],

    who:
      "Approved families and individuals facing food insecurity or immediate household shortages.",

    process:
      "Verified donations are converted into available resources, an approved need is selected, and a Distribution Officer records the quantity delivered.",
  },

  {
    id: "p3",
    title: "Medical Assistance",

    short_description:
      "Helping vulnerable beneficiaries respond to verified health-related needs.",

    description:
      "Medical Assistance supports beneficiaries whose circumstances include health-related financial or practical needs. Sensitive information remains within the staff system, while applications follow the same review process as other forms of assistance. Ishraq can use the case history to avoid losing important context between registration, review and support delivery.",

    image: publicImages.programs.medical,
    icon: HeartPulse,

    focus: [
      "Verified health-related assistance requests",
      "Medical financial support where approved",
      "Confidential case information limited to authorized staff",
    ],

    who:
      "Registered beneficiaries with documented medical needs that fall within the organization's available support.",

    process:
      "The need is recorded with supporting information, reviewed by Admin and connected to appropriate charitable assistance when resources are available.",
  },

  {
    id: "p4",
    title: "Housing & Family Stability",

    short_description:
      "Practical support for households facing rent and other family-stability challenges.",

    description:
      "Housing pressure can quickly affect a family's safety, education and ability to meet basic needs. Ishraq records housing and rent-related assistance requests as part of the beneficiary case, allowing staff to understand the household situation and review support consistently rather than relying on disconnected paper records.",

    image: publicImages.programs.housing,
    icon: Home,

    focus: [
      "House-rent assistance",
      "Essential support connected to family stability",
      "Case-by-case review based on documented circumstances",
    ],

    who:
      "Beneficiary households facing rent pressure, unstable accommodation or related family emergencies.",

    process:
      "Household information is registered, an assistance application explains the need, and Admin decides whether the request is approved, rejected or needs more information.",
  },

  {
    id: "p5",
    title: "Livelihood & Job Creation",

    short_description:
      "Support intended to strengthen long-term independence and household resilience.",

    description:
      "Where appropriate, Ishraq can manage assistance connected to livelihood or job-creation needs. The purpose is to support practical opportunities that may improve a household's ability to generate income and reduce repeated emergency dependence. Each request remains tied to the beneficiary's history for follow-up and accountability.",

    image: publicImages.programs.livelihood,
    icon: Activity,

    focus: [
      "Livelihood-oriented assistance",
      "Job-creation support where available",
      "Follow-up through beneficiary and assistance records",
    ],

    who:
      "Approved beneficiaries whose assessed need includes income generation, livelihood stability or job-creation support.",

    process:
      "The requested support is documented, reviewed, and connected to available charitable resources or approved monetary assistance.",
  },

  {
    id: "p6",
    title: "Emergency & Community Response",

    short_description:
      "Coordinated activities and distributions when communities face urgent or seasonal needs.",

    description:
      "Ishraq can organize charity activities around urgent, seasonal or community-wide needs. Activities identify the title, date, location, status and responsible staff member. Related distributions then connect beneficiaries, resources and activities so management can see what was distributed, where it happened and who was responsible.",

    image: publicImages.programs.emergency,
    icon: ShieldCheck,

    focus: [
      "Planned and emergency charity activities",
      "Resource distributions for approved beneficiaries",
      "Transparent activity and distribution history",
    ],

    who:
      "Communities and approved beneficiaries affected by urgent, seasonal or organized charitable needs.",

    process:
      "A charity activity is planned, resources are checked, approved beneficiaries are selected and each completed distribution is recorded in the system.",
  },
];

const iconCycle = [
  BookOpen,
  Package,
  HeartPulse,
  Home,
  Activity,
  ShieldCheck,
];

export default function Programs() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;

    api(
      `/content/public${qs({
        type: "Program",
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

  const display = useMemo(() => {
    if (!items.length) {
      return fallback;
    }

    return items.map(
      (item, index) => {
        const fallbackItem =
          fallback[
            index %
              fallback.length
          ];

        return {
          ...fallbackItem,
          ...item,

          icon:
            iconCycle[
              index %
                iconCycle.length
            ],

          image:
            item.image ||
            fallbackItem.image,

          focus:
            fallbackItem.focus,

          who:
            fallbackItem.who,

          process:
            fallbackItem.process,
        };
      }
    );
  }, [items]);

  return (
    <main className="editorial-page">
      <section className="page-hero shell">
        <PageHeader
          eyebrow="OUR PROGRAMS"
          title="Support designed around real community needs."
          description="Ishraq organizes assistance across education, food, health, housing, livelihoods and community response. Each program connects public generosity with structured beneficiary, resource and distribution management."
        />
      </section>

      <section className="section shell editorial-intro program-intro">
        <div>
          <span className="eyebrow">
            HOW PROGRAMS WORK
          </span>

          <h2>
            Different needs. One
            coordinated mission.
          </h2>
        </div>

        <div>
          <p>
            Programs give Ishraq's
            charitable work a clear
            public structure. Behind
            each program, staff register
            beneficiaries, document the
            need, review assistance,
            verify donations, track
            available resources and
            record distributions.
          </p>

          <p>
            This creates a traceable
            path from a community need
            to the support actually
            delivered.
          </p>
        </div>
      </section>

      <section
        className="program-journey shell"
        aria-label="Program process"
      >
        {[
          "Register the need",
          "Review the application",
          "Match available support",
          "Record the assistance",
        ].map((step, index) => (
          <div
            className="program-journey-step"
            key={step}
          >
            <span>
              {String(
                index + 1
              ).padStart(2, "0")}
            </span>

            <strong>
              {step}
            </strong>
          </div>
        ))}
      </section>

      <section className="program-detail-list">
        {display.map(
          (item, index) => {
            const Icon =
              item.icon ||
              iconCycle[
                index %
                  iconCycle.length
              ];

            return (
              <article
                className={`program-detail-row ${
                  index % 2
                    ? "program-detail-row-reverse"
                    : ""
                }`}
                key={
                  item.id ||
                  item.title
                }
              >
                <div className="shell program-detail-inner">
                  <div className="program-detail-image-wrap">
                    <img
                      src={
                        item.image
                      }
                      alt={
                        item.title
                      }
                      className="program-detail-image"
                      loading="lazy"
                    />

                    <div className="program-detail-image-label">
                      <Icon
                        size={
                          18
                        }
                      />

                      <span>
                        {String(
                          index +
                            1
                        ).padStart(
                          2,
                          "0"
                        )}{" "}
                        / ISHRAQ
                        PROGRAM
                      </span>
                    </div>
                  </div>

                  <div className="program-detail-copy">
                    <span className="eyebrow">
                      {item.short_description ||
                        "ORGANIZED COMMUNITY SUPPORT"}
                    </span>

                    <h2>
                      {
                        item.title
                      }
                    </h2>

                    <p className="program-lead">
                      {item.description ||
                        item.short_description}
                    </p>

                    <div className="program-context-lines">
                      <div>
                        <span>
                          WHO IT
                          HELPS
                        </span>

                        <p>
                          {
                            item.who
                          }
                        </p>
                      </div>

                      <div>
                        <span>
                          HOW SUPPORT
                          MOVES
                        </span>

                        <p>
                          {
                            item.process
                          }
                        </p>
                      </div>
                    </div>

                    <div className="program-focus-block">
                      <h3>
                        What this
                        program can
                        support
                      </h3>

                      <ul>
                        {(
                          item.focus ||
                          [
                            "Verified beneficiary needs",
                            "Organized assistance",
                            "Accountable distribution and follow-up",
                          ]
                        ).map(
                          (
                            point
                          ) => (
                            <li
                              key={
                                point
                              }
                            >
                              {
                                point
                              }
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="program-detail-actions">
                      <Link
                        to="/donate"
                        className="btn btn-gold"
                      >
                        Support this
                        work
                      </Link>

                      <Link
                        to="/contact"
                        className="text-link"
                      >
                        Ask about the
                        program

                        <ArrowRight
                          size={
                            16
                          }
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          }
        )}
      </section>

      <section className="program-image-note shell">
        <span className="eyebrow">
          EDITABLE IMAGES
        </span>

        <p>
          Fallback image links are stored
          in{" "}
          <code>
            client/src/config/publicImages.js
          </code>
          . Admin Public Content image
          URLs override the fallback
          program images.
        </p>
      </section>

      <section className="cta-band">
        <div className="shell">
          <div>
            <span className="eyebrow">
              SUPPORT A PROGRAM
            </span>

            <h2>
              Help turn a community need
              into action.
            </h2>
          </div>

          <div className="cta-actions">
            <Link
              to="/donate"
              className="btn btn-gold"
            >
              Donate Now
            </Link>

            <Link
              to="/contact"
              className="btn btn-ghost"
            >
              Contact Ishraq

              <ArrowRight
                size={16}
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

