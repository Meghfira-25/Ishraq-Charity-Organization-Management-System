import {
  Camera,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

const emptyPassword = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    profile_picture: null,
  });

  const [passwords, setPasswords] = useState(emptyPassword);

  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    setForm({
      full_name: user.full_name || "",
      phone_number: user.phone_number || "",
      profile_picture: user.profile_picture || null,
    });
  }, [user]);

  const initials = useMemo(() => {
    const parts = String(user?.full_name || "I")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    return (
      parts
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "I"
    );
  }, [user?.full_name]);

  async function uploadPhoto(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    try {
      setUploading(true);

      const data = await fileToDataUrl(file);

      const uploaded = await api("/uploads", {
        method: "POST",
        body: JSON.stringify({
          file_name: file.name,
          mime_type: file.type,
          data,
          visibility: "public",
        }),
      });

      setForm((prev) => ({
        ...prev,
        profile_picture: uploaded.path,
      }));

      setMessage(
        "Photo uploaded. Click Save profile to apply it."
      );
    } catch (err) {
      setError(
        err.message || "Unable to upload photo"
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function saveProfile(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    try {
      setSaving(true);

      const updated = await api("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      });

      setUser(updated);

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.message || "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      passwords.new_password !==
      passwords.confirm_password
    ) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setChanging(true);

      await api("/auth/password", {
        method: "PUT",
        body: JSON.stringify({
          current_password:
            passwords.current_password,
          new_password:
            passwords.new_password,
        }),
      });

      setPasswords(emptyPassword);

      setMessage(
        "Password changed successfully."
      );
    } catch (err) {
      setError(
        err.message || "Unable to change password"
      );
    } finally {
      setChanging(false);
    }
  }

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const imageSrc =
    form.profile_picture ||
    user?.profile_picture;

  return (
    <div>
      <div className="page-head profile-page-head">
        <div>
          <span>ACCOUNT</span>

          <h1>My Profile</h1>

          <p>
            Manage your personal information,
            profile photo and password.
          </p>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`profile-alert ${
            error
              ? "profile-alert-error"
              : "profile-alert-success"
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="profile-layout">
        <aside className="profile-summary panel">
          <div className="profile-photo-wrap">
            {imageSrc ? (
              <img
                className="profile-photo"
                src={imageSrc}
                alt="Staff profile"
              />
            ) : (
              <div className="profile-photo profile-photo-fallback">
                {initials}
              </div>
            )}

            <label
              className="profile-photo-edit"
              title="Change profile picture"
            >
              <Camera size={17} />

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadPhoto}
                disabled={uploading}
              />
            </label>
          </div>

          <h2>{user?.full_name}</h2>

          <span className="profile-role">
            <ShieldCheck size={15} />

            {user?.role?.replaceAll("-", " ")}
          </span>

          <div className="profile-contact-row">
            <Mail size={15} />
            <span>{user?.email}</span>
          </div>

          <div className="profile-contact-row">
            <Phone size={15} />

            <span>
              {user?.phone_number ||
                "No phone number"}
            </span>
          </div>

          <small className="profile-note">
            Your email and role are controlled
            by the administrator and cannot be
            changed here.
          </small>
        </aside>

        <div className="profile-main-column">
          <form
            className="form-card profile-form"
            onSubmit={saveProfile}
          >
            <div className="profile-section-title">
              <UserRound size={20} />

              <div>
                <h3>
                  Personal information
                </h3>

                <p>
                  Update the details shown across
                  the staff system.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Full name

                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleProfileChange}
                  required
                  maxLength={100}
                />
              </label>

              <label>
                Phone number

                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleProfileChange}
                  maxLength={20}
                  placeholder="e.g. 0911000000"
                />
              </label>

              <label>
                Email

                <input
                  value={user?.email || ""}
                  disabled
                />
              </label>

              <label>
                Role

                <input
                  value={
                    user?.role?.replaceAll(
                      "-",
                      " "
                    ) || ""
                  }
                  disabled
                />
              </label>
            </div>

            <div className="profile-form-actions">
              <button
                className="btn btn-gold"
                type="submit"
                disabled={
                  saving || uploading
                }
              >
                {saving
                  ? "Saving..."
                  : "Save profile"}
              </button>
            </div>
          </form>

          <form
            className="form-card profile-form"
            onSubmit={changePassword}
          >
            <div className="profile-section-title">
              <KeyRound size={20} />

              <div>
                <h3>Change password</h3>

                <p>
                  Use your current password before
                  setting a new one.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <label>
                Current password

                <input
                  type="password"
                  name="current_password"
                  autoComplete="current-password"
                  value={
                    passwords.current_password
                  }
                  onChange={
                    handlePasswordChange
                  }
                  required
                />
              </label>

              <div />

              <label>
                New password

                <input
                  type="password"
                  name="new_password"
                  autoComplete="new-password"
                  minLength={8}
                  value={
                    passwords.new_password
                  }
                  onChange={
                    handlePasswordChange
                  }
                  required
                />
              </label>

              <label>
                Confirm new password

                <input
                  type="password"
                  name="confirm_password"
                  autoComplete="new-password"
                  minLength={8}
                  value={
                    passwords.confirm_password
                  }
                  onChange={
                    handlePasswordChange
                  }
                  required
                />
              </label>
            </div>

            <div className="profile-form-actions">
              <button
                className="btn btn-soft"
                type="submit"
                disabled={changing}
              >
                {changing
                  ? "Changing..."
                  : "Change password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

