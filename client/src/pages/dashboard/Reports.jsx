import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { api } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import { ErrorState, LoadingState } from "../../components/DataState.jsx";

function ReportBlock({ title, rows }) {
  return (
    <section className="panel report-block">
      <div className="panel-head">
        <h3>{title}</h3>
      </div>

      {!rows?.length ? (
        <p className="muted">No data yet.</p>
      ) : (
        <div className="report-list">
          {rows.map((row, index) => (
            <div
              className="report-row"
              key={index}
            >
              {Object.entries(row).map(([key, value]) => (
                <span key={key}>
                  <small>
                    {key.replaceAll("_", " ")}
                  </small>

                  <b>
                    {value ?? "—"}
                  </b>
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReports() {
      try {
        const result = await api("/reports/summary");
        setData(result);
        setError(null);
      } catch (error) {
        setError(error);
      }
    }

    loadReports();
  }, []);

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <>
      <PageHeader
        eyebrow="ANALYTICS"
        title="Reports"
        description="Basic management reports generated from live system records."
        action={
          <button
            className="btn btn-soft"
            onClick={() => window.print()}
          >
            <Printer size={17} />
            Print
          </button>
        }
      />

      {!data ? (
        <LoadingState />
      ) : (
        <div className="reports-grid">
          <ReportBlock
            title="Beneficiaries"
            rows={data.beneficiaries}
          />

          <ReportBlock
            title="Members"
            rows={data.members}
          />

          <ReportBlock
            title="Assistance"
            rows={data.assistance}
          />

          <ReportBlock
            title="Donations"
            rows={data.donations}
          />

          <ReportBlock
            title="Resources"
            rows={data.resources}
          />

          <ReportBlock
            title="Distribution by month"
            rows={data.distributions}
          />

          <ReportBlock
            title="Activities"
            rows={data.activities}
          />
        </div>
      )}
    </>
  );
}

