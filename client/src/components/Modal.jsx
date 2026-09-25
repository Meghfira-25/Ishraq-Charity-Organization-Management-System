import { X } from "lucide-react";

export default function Modal({
  open,
  title,
  children,
  onClose,
  wide = false,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className={`modal ${
          wide ? "modal-wide" : ""
        }`}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-head">
          <h3>{title}</h3>

          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

