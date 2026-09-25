import { useEffect, useMemo, useState } from "react";

import {
  Eye,
  FileImage,
  FileText,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { api, qs } from "../../api/client.js";
import {
  fileToDataUrl,
  openProtectedFile,
} from "../../api/files.js";

import { useAuth } from "../../context/AuthContext.jsx";

import PageHeader from "../../components/PageHeader.jsx";
import Modal from "../../components/Modal.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/DataState.jsx";

const blank = {
  full_name: "",
  gender: "Female",
  nationality: "Ethiopian",
  birth_date: "",
  marriage_status: "Single",
  education_level: "Secondary",
  source_of_income: "",
  monthly_income: "",
  phone_number: "",
  city: "",
  woreda: "",
  kebele: "",
  address: "",
  home_ownership: "Rental",
  house_rooms: "",
  has_external_support: "No",
  external_support: "",
  support_type: "Food",
  notes: "",
  uploaded_files: [],
};

function normalizeFiles(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
}

export default function Beneficiaries() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(blank);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);

    try {
      const data = await api(
        `/beneficiaries${qs({
          limit: 100,
          search,
          status,
        })}`
      );

      setItems(data.items || []);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const canEdit = [
    "Admin",
    "Registration-Officer",
  ].includes(user?.role);

  const proofCount = useMemo(() => {
    return normalizeFiles(
      form.uploaded_files
    ).length;
  }, [form.uploaded_files]);

  function startCreate() {
    setEditingId(null);
    setForm(blank);
    setFormError("");
    setOpen(true);
  }

  function startEdit(beneficiary) {
    setEditingId(beneficiary.id);

    setForm({
      ...blank,
      ...beneficiary,

      birth_date: beneficiary.birth_date
        ? String(
            beneficiary.birth_date
          ).slice(0, 10)
        : "",

      monthly_income:
        beneficiary.monthly_income ?? "",

      house_rooms:
        beneficiary.house_rooms ?? "",

      uploaded_files: normalizeFiles(
        beneficiary.uploaded_files
      ),
    });

    setFormError("");
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setEditingId(null);
    setForm(blank);
    setFormError("");
  }

  async function uploadProofs(event) {
    const files = [
      ...(event.target.files || []),
    ];

    event.target.value = "";

    if (!files.length) {
      return;
    }

    setFormError("");

    const acceptedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    const invalidFile = files.find(
      (file) =>
        !acceptedTypes.includes(file.type)
    );

    if (invalidFile) {
      setFormError(
        "Proof files must be JPG, PNG, WEBP or PDF."
      );

      return;
    }

    try {
      setUploading(true);

      const uploaded = [];

      for (const file of files) {
        const data =
          await fileToDataUrl(file);

        const result = await api(
          "/uploads",
          {
            method: "POST",

            body: JSON.stringify({
              file_name: file.name,
              mime_type: file.type,
              data,
              visibility: "private",
            }),
          }
        );

        uploaded.push(result);
      }

      setForm((prev) => ({
        ...prev,

        uploaded_files: [
          ...normalizeFiles(
            prev.uploaded_files
          ),
          ...uploaded,
        ],
      }));
    } catch (error) {
      setFormError(
        error.message ||
          "Unable to upload proof file"
      );
    } finally {
      setUploading(false);
    }
  }

  function removeProof(index) {
    setForm((prev) => ({
      ...prev,

      uploaded_files: normalizeFiles(
        prev.uploaded_files
      ).filter(
        (_, fileIndex) =>
          fileIndex !== index
      ),
    }));
  }

  async function viewProof(file) {
    try {
      await openProtectedFile(file.path);
    } catch (error) {
      window.alert(
        error.message ||
          "Unable to open proof"
      );
    }
  }

  async function save(event) {
    event.preventDefault();

    setFormError("");

    const files = normalizeFiles(
      form.uploaded_files
    );

    if (
      !editingId &&
      files.length === 0
    ) {
      setFormError(
        "At least one supporting image or PDF proof is required when registering a beneficiary."
      );

      return;
    }

    const body = {
      ...form,

      uploaded_files: files,

      monthly_income:
        form.monthly_income !== ""
          ? Number(form.monthly_income)
          : null,

      house_rooms:
        form.house_rooms !== ""
          ? Number(form.house_rooms)
          : null,
    };

    try {
      if (editingId) {
        await api(
          `/beneficiaries/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(body),
          }
        );
      } else {
        await api("/beneficiaries", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }

      closeModal();
      await load();
    } catch (error) {
      setFormError(
        error.message ||
          "Unable to save beneficiary"
      );
    }
  }

  async function review(
    id,
    newStatus
  ) {
    const reviewNotes =
      window.prompt(
        `Optional notes for ${newStatus}:`
      ) || "";

    try {
      await api(
        `/beneficiaries/${id}/review`,
        {
          method: "PATCH",

          body: JSON.stringify({
            status: newStatus,
            review_notes:
              reviewNotes,
          }),
        }
      );

      await load();
    } catch (error) {
      setError(error);
    }
  }

  function handleSearchKeyDown(
    event
  ) {
    if (event.key === "Enter") {
      load();
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="REGISTRATION"
        title="Beneficiaries"
        description="Registration Officers can register and edit beneficiary records, attach supporting proof, and maintain information before or after administrative review."
        action={
          canEdit ? (
            <button
              className="btn btn-gold"
              onClick={startCreate}
            >
              <Plus size={17} />
              Register Beneficiary
            </button>
          ) : null
        }
      />

      <div className="filters">
        <div className="search-box">
          <Search size={17} />

          <input
            placeholder="Search name, phone or city"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            onKeyDown={
              handleSearchKeyDown
            }
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value
            )
          }
        >
          <option value="">
            All statuses
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Approved">
            Approved
          </option>

          <option value="Rejected">
            Rejected
          </option>
        </select>

        <button
          className="btn btn-soft"
          onClick={load}
        >
          Search
        </button>
      </div>

      {error && (
        <ErrorState error={error} />
      )}

      <section className="panel">
        {loading ? (
          <LoadingState />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Beneficiary</th>
                  <th>Location</th>
                  <th>Support</th>
                  <th>Proof</th>
                  <th>
                    Registered by
                  </th>
                  <th>Status</th>

                  {canEdit && (
                    <th>Edit</th>
                  )}

                  {user?.role ===
                    "Admin" && (
                    <th>Review</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {items.map(
                  (beneficiary) => {
                    const proofs =
                      normalizeFiles(
                        beneficiary.uploaded_files
                      );

                    return (
                      <tr
                        key={
                          beneficiary.id
                        }
                      >
                        <td>
                          <b>
                            {
                              beneficiary.full_name
                            }
                          </b>

                          <small>
                            {beneficiary.phone_number ||
                              "No phone"}
                          </small>
                        </td>

                        <td>
                          {[
                            beneficiary.city,
                            beneficiary.woreda,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              ", "
                            ) || "—"}
                        </td>

                        <td>
                          {beneficiary.support_type?.replaceAll(
                            "_",
                            " "
                          ) || "—"}
                        </td>

                        <td>
                          {proofs.length ? (
                            <button
                              className="btn btn-soft btn-xs"
                              onClick={() =>
                                viewProof(
                                  proofs[0]
                                )
                              }
                            >
                              <Eye
                                size={
                                  13
                                }
                              />

                              {
                                proofs.length
                              }{" "}
                              file
                              {proofs.length >
                              1
                                ? "s"
                                : ""}
                            </button>
                          ) : (
                            <span className="muted">
                              No proof
                            </span>
                          )}
                        </td>

                        <td>
                          {
                            beneficiary.registered_by_name
                          }
                        </td>

                        <td>
                          <StatusBadge
                            value={
                              beneficiary.status
                            }
                          />
                        </td>

                        {canEdit && (
                          <td>
                            <button
                              className="btn btn-soft btn-xs"
                              onClick={() =>
                                startEdit(
                                  beneficiary
                                )
                              }
                            >
                              <Pencil
                                size={
                                  13
                                }
                              />
                              Edit
                            </button>
                          </td>
                        )}

                        {user?.role ===
                          "Admin" && (
                          <td>
                            <div className="row-actions">
                              <button
                                className="btn btn-success btn-xs"
                                onClick={() =>
                                  review(
                                    beneficiary.id,
                                    "Approved"
                                  )
                                }
                              >
                                Approve
                              </button>

                              <button
                                className="btn btn-danger btn-xs"
                                onClick={() =>
                                  review(
                                    beneficiary.id,
                                    "Rejected"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={open}
        title={
          editingId
            ? "Edit beneficiary"
            : "Register beneficiary"
        }
        onClose={closeModal}
        wide
      >
        <form
          className="modal-form"
          onSubmit={save}
        >
          <div className="form-grid">
            <label>
              Full name

              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Gender

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="Female">
                  Female
                </option>

                <option value="Male">
                  Male
                </option>
              </select>
            </label>

            <label>
              Birth date

              <input
                type="date"
                name="birth_date"
                value={
                  form.birth_date ||
                  ""
                }
                onChange={handleChange}
              />
            </label>

            <label>
              Nationality

              <input
                name="nationality"
                value={
                  form.nationality ||
                  ""
                }
                onChange={handleChange}
              />
            </label>

            <label>
              Marital status

              <select
                name="marriage_status"
                value={
                  form.marriage_status ||
                  "Single"
                }
                onChange={handleChange}
              >
                <option value="Single">
                  Single
                </option>

                <option value="Married">
                  Married
                </option>

                <option value="Divorced">
                  Divorced
                </option>

                <option value="Widowed">
                  Widowed
                </option>
              </select>
            </label>

            <label>
              Education

              <select
                name="education_level"
                value={
                  form.education_level ||
                  "Secondary"
                }
                onChange={handleChange}
              >
                {[
                  "Not_Educated",
                  "Primary",
                  "Secondary",
                  "Degree",
                  "Masters",
                  "PHD",
                  "Other",
                ].map((level) => (
                  <option
                    key={level}
                    value={level}
                  >
                    {level.replaceAll(
                      "_",
                      " "
                    )}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Source of income

              <input
                name="source_of_income"
                value={
                  form.source_of_income ||
                  ""
                }
                onChange={handleChange}
              />
            </label>

            <label>
              Monthly income

              <input
                type="number"
                min="0"
                name="monthly_income"
                value={
                  form.monthly_income
                }
                onChange={handleChange}
              />
            </label>

            <label>
              Phone

              <input
                name="phone_number"
                value={
                  form.phone_number ||
                  ""
                }
                onChange={handleChange}
              />
            </label>

            <label>
              City

              <input
                name="city"
                value={form.city || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Woreda

              <input
                name="woreda"
                value={
                  form.woreda || ""
                }
                onChange={handleChange}
              />
            </label>

            <label>
              Kebele

              <input
                name="kebele"
                value={
                  form.kebele || ""
                }
                onChange={handleChange}
              />
            </label>

            <label>
              Home ownership

              <select
                name="home_ownership"
                value={
                  form.home_ownership ||
                  "Rental"
                }
                onChange={handleChange}
              >
                <option value="Rental">
                  Rental
                </option>

                <option value="Own">
                  Own
                </option>
              </select>
            </label>

            <label>
              House rooms

              <input
                type="number"
                min="0"
                name="house_rooms"
                value={
                  form.house_rooms
                }
                onChange={handleChange}
              />
            </label>

            <label>
              External support?

              <select
                name="has_external_support"
                value={
                  form.has_external_support ||
                  "No"
                }
                onChange={handleChange}
              >
                <option value="No">
                  No
                </option>

                <option value="Yes">
                  Yes
                </option>
              </select>
            </label>

            <label>
              External support details

              <input
                name="external_support"
                value={
                  form.external_support ||
                  ""
                }
                onChange={handleChange}
              />
            </label>

            <label>
              Support type

              <select
                name="support_type"
                value={
                  form.support_type ||
                  "Food"
                }
                onChange={handleChange}
              >
                {[
                  "Food",
                  "Children_Education",
                  "Money",
                  "Job_creation",
                  "House_rent",
                  "Medical",
                  "Other",
                ].map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type.replaceAll(
                      "_",
                      " "
                    )}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Address

            <input
              name="address"
              value={
                form.address || ""
              }
              onChange={handleChange}
            />
          </label>

          <label>
            Notes

            <textarea
              name="notes"
              rows="3"
              value={
                form.notes || ""
              }
              onChange={handleChange}
            />
          </label>

          <section className="beneficiary-proof-section">
            <div className="proof-section-heading">
              <div>
                <span className="eyebrow">
                  SUPPORTING PROOF
                </span>

                <h3>
                  Attach beneficiary
                  documents or images
                </h3>

                <p>
                  Upload a supporting
                  image or PDF such as
                  an ID copy, referral
                  letter, supporting
                  document, or other
                  evidence used during
                  registration.
                </p>
              </div>

              <label
                className={`btn btn-soft proof-upload-button ${
                  uploading
                    ? "disabled"
                    : ""
                }`}
              >
                <UploadCloud
                  size={16}
                />

                {uploading
                  ? "Uploading..."
                  : "Upload proof"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  multiple
                  onChange={
                    uploadProofs
                  }
                  disabled={
                    uploading
                  }
                />
              </label>
            </div>

            <div className="proof-file-list">
              {normalizeFiles(
                form.uploaded_files
              ).length === 0 ? (
                <div className="proof-empty">
                  <Paperclip
                    size={19}
                  />

                  <span>
                    No proof files
                    uploaded yet. A
                    proof file is
                    required for a new
                    beneficiary.
                  </span>
                </div>
              ) : (
                normalizeFiles(
                  form.uploaded_files
                ).map(
                  (
                    file,
                    index
                  ) => {
                    const isPdf =
                      file.mime_type ===
                      "application/pdf";

                    const Icon =
                      isPdf
                        ? FileText
                        : FileImage;

                    return (
                      <div
                        className="proof-file"
                        key={`${file.path}-${index}`}
                      >
                        <Icon
                          size={
                            19
                          }
                        />

                        <div>
                          <b>
                            {file.original_name ||
                              file.file_name ||
                              `Proof ${
                                index +
                                1
                              }`}
                          </b>

                          <small>
                            {file.mime_type ||
                              "Supporting file"}
                          </small>
                        </div>

                        <button
                          type="button"
                          className="icon-btn"
                          title="View proof"
                          onClick={() =>
                            viewProof(
                              file
                            )
                          }
                        >
                          <Eye
                            size={
                              15
                            }
                          />
                        </button>

                        <button
                          type="button"
                          className="icon-btn danger-icon"
                          title="Remove proof"
                          onClick={() =>
                            removeProof(
                              index
                            )
                          }
                        >
                          <Trash2
                            size={
                              15
                            }
                          />
                        </button>
                      </div>
                    );
                  }
                )
              )}
            </div>

            <small className="proof-count">
              {proofCount} proof file
              {proofCount === 1
                ? ""
                : "s"}{" "}
              attached
            </small>
          </section>

          {formError && (
            <div className="profile-alert profile-alert-error">
              {formError}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={closeModal}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-gold"
              disabled={uploading}
            >
              {editingId
                ? "Save Changes"
                : "Save Beneficiary"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

