import { useEffect, useState } from "react";
import { Menu, X, LogIn, ArrowRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo.jsx";

const links = [
  ["/", "Home"],
  ["/about", "About"],
  ["/programs", "Programs"],
  ["/annual-plans", "Annual Plans"],
  ["/stories", "Success Stories"],
  ["/news", "Events & News"],
  ["/contact", "Contact"],
];

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 35);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="public-nav-wrap">
      <nav className={`public-nav ${scrolled ? "public-nav-scrolled" : ""}`}>
        <NavLink to="/" className="public-nav-logo" aria-label="Ishraq home">
          <Logo />
        </NavLink>

        <div className="public-nav-links public-nav-links-desktop">
          {links.map(([path, label]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `public-nav-link ${isActive ? "public-nav-link-active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        <div className="public-nav-actions public-nav-actions-desktop">
          <NavLink to="/login" className="public-login-btn">
            <LogIn size={16} />
            Login
          </NavLink>

          <NavLink to="/donate" className="public-donate-btn">
            Donate Now
            <ArrowRight size={16} />
          </NavLink>
        </div>

        <button
          type="button"
          className="public-menu-btn"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <button
        type="button"
        aria-label="Close navigation"
        className={`public-menu-backdrop ${menuOpen ? "public-menu-backdrop-open" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <aside className={`public-mobile-menu ${menuOpen ? "public-mobile-menu-open" : ""}`}>
        <div className="public-mobile-menu-head">
          <Logo />
          <button type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}>
            <X size={21} />
          </button>
        </div>

        <nav className="public-mobile-menu-links" aria-label="Mobile navigation">
          {links.map(([path, label], index) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `public-mobile-menu-link ${isActive ? "public-mobile-menu-link-active" : ""}`
              }
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="public-mobile-menu-actions">
          <NavLink to="/login" className="public-login-btn">
            <LogIn size={16} /> Login
          </NavLink>
          <NavLink to="/donate" className="public-donate-btn">
            Donate Now <ArrowRight size={16} />
          </NavLink>
        </div>
      </aside>
    </header>
  );
}
