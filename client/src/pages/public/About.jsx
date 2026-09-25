import {
  ArrowRight,
  HeartHandshake,
} from "lucide-react";

import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import { publicImages } from "../../config/publicImages.js";

const principles = [
  [
    "01",
    "Dignity first",
    "Beneficiary support should respect privacy, individual circumstances and human dignity at every stage.",
  ],
  [
    "02",
    "Accountability",
    "Donations, resources and distributions are organized so staff can follow how support moves through the organization.",
  ],
  [
    "03",
    "Practical impact",
    "Programs and assistance are connected to real needs such as food, education, medical support and family stability.",
  ],
];

export default function About() {
  return (
    <main className="editorial-page">
      <section className="page-hero shell">
        <PageHeader
          eyebrow="ABOUT ISHRAQ"
          title="Hope with structure. Service with accountability."
          description="Ishraq Charity Organization coordinates community support, beneficiary assistance and charitable resources through one focused mission."
        />
      </section>

      <section className="section shell about-manifesto">
        <div className="about-manifesto-mark">
          <HeartHandshake size={42} />
        </div>

        <p className="about-manifesto-copy">
          We believe charity is strongest when
          compassion is matched with{" "}
          <span>
            clarity, responsibility and long-term care.
          </span>
        </p>
      </section>

      <section className="about-photo-band shell">
        <img
          src={publicImages.aboutCommunity}
          alt="Community charity work"
          loading="lazy"
        />

        <div>
          <span className="eyebrow">
            COMMUNITY AT THE CENTER
          </span>

          {/* <p>
            Change this image any time from{" "}
            <code>
              client/src/config/publicImages.js
            </code>
            .
          </p> */}
        </div>
      </section>

      <section className="editorial-band">
        <div className="shell editorial-split">
          <div>
            <span className="eyebrow">
              WHO WE ARE
            </span>

            <h2>
              A community organization built around
              responsible support.
            </h2>
          </div>

          <div className="editorial-prose">
            <p>
              Ishraq brings together charitable
              programs, donations, beneficiary
              assistance and community activities in
              a coordinated way. The goal is not only
              to provide help, but to make that help
              easier to organize, follow and improve.
            </p>

            <p>
              Our work focuses on vulnerable
              communities while protecting sensitive
              beneficiary information and keeping
              public communication centered on
              programs, activities and aggregate
              impact.
            </p>
          </div>
        </div>
      </section>

      <section className="section shell purpose-lines">
        <div className="purpose-line">
          <span className="eyebrow">
            OUR MISSION
          </span>

          <h2>
            Support vulnerable communities through
            organized, respectful and sustainable
            charity programs.
          </h2>
        </div>

        <div className="purpose-line">
          <span className="eyebrow">
            OUR VISION
          </span>

          <h2>
            Communities where support is accessible,
            transparent and able to create lasting
            opportunity.
          </h2>
        </div>
      </section>

      <section className="editorial-band editorial-band-dark">
        <div className="shell">
          <div className="section-heading editorial-heading">
            <span className="eyebrow">
              HOW WE WORK
            </span>

            <h2>
              Compassion, organized into a clear
              process.
            </h2>
          </div>

          <div className="principle-list">
            {principles.map(
              ([number, title, text]) => (
                <div
                  className="principle-row"
                  key={number}
                >
                  <span className="principle-number">
                    {number}
                  </span>

                  <h3>{title}</h3>

                  <p>{text}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="shell">
          <div>
            <span className="eyebrow">
              BE PART OF THE MISSION
            </span>

            <h2>
              There is a place for your support.
            </h2>
          </div>

          <div className="cta-actions">
            <Link
              to="/programs"
              className="btn btn-ghost"
            >
              Explore Programs
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/donate"
              className="btn btn-gold"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
