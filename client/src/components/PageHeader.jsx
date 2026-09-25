import Logo from "./Logo.jsx";

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
  showLogo = false,
}) {
  return (
    <div className="page-head">
      <div>
        {showLogo && (
          <div className="page-head-brand" aria-label="Ishraq Charity Organization">
            <Logo />
          </div>
        )}

        {eyebrow && (
          <span className="eyebrow">
            {eyebrow}
          </span>
        )}

        <h1>{title}</h1>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {action}
    </div>
  );
}
