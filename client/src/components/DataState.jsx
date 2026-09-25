export function LoadingState() {
  return (
    <div className="data-state">
      <div className="spinner" />

      <p>Loading...</p>
    </div>
  );
}

export function EmptyState({
  text = "No records found.",
}) {
  return (
    <div className="data-state">
      <p>{text}</p>
    </div>
  );
}

export function ErrorState({ error }) {
  return (
    <div className="alert alert-error">
      {error?.message ||
        "Something went wrong."}
    </div>
  );
}

