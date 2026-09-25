export default function StatusBadge({
  value = "Unknown",
}) {
  const key = String(value)
    .toLowerCase()
    .replace(/[^a-z]/g, "-");

  const label = String(value).replaceAll(
    "_",
    " "
  );

  return (
    <span
      className={`status status-${key}`}
    >
      {label}
    </span>
  );
}

