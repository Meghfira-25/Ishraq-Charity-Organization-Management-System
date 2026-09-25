import { useState } from "react";
import {
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Logo from "../../components/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Login() {
  const { user, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  async function submit(event) {
    event.preventDefault();

    setBusy(true);
    setError("");

    try {
      await login(email, password);

      navigate(
        location.state?.from ||
          "/dashboard",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "LOGIN PAGE ERROR:",
        error
      );

      setError(
        error?.message ||
          "Unable to sign in."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-art">
        <div>
          <Logo />

          <span className="eyebrow">
            STAFF PORTAL
          </span>

          <h1>
            Manage impact.
            <br />
            <em>Protect trust.</em>
          </h1>

          <p>
            Secure access for Ishraq
            administrators, registration
            officers and distribution
            officers.
          </p>
        </div>
      </div>

      <div className="login-panel">
        <form onSubmit={submit}>
          <span className="eyebrow">
            WELCOME BACK
          </span>

          <h2>Staff Login</h2>

          <p>
            Use your Ishraq staff account.
          </p>

          <label>
            Email

            <div className="input-icon">
              <Mail size={18} />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label>
            Password

            <div className="input-icon">
              <LockKeyhole size={18} />

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-gold btn-block"
            disabled={busy}
          >
            {busy
              ? "Signing in..."
              : "Login"}
          </button>

          <small>
            Authorized staff only.
          </small>
        </form>
      </div>
    </main>
  );
}