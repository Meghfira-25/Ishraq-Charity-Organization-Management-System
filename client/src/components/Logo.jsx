import { HeartHandshake } from "lucide-react";

export default function Logo({ compact = false }) {
  return (
    <div className="brand-lockup">
      <div className="brand-mark brand-mark-heart" aria-hidden="true">
        <span className="brand-mark-ring" />
        <HeartHandshake size={22} />
      </div>
      <div className="brand-copy">
        <strong>ISHRAQ</strong>
        {!compact && (
          <span>Charity Organization</span>
        )}
      </div>
    </div>
  );
}