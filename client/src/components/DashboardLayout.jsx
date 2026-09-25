import { useState } from "react";
import {
  Activity,
  Boxes,
  ClipboardList,
  FileBarChart,
  HandCoins,
  HeartHandshake,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  CalendarRange,
  ShieldCheck,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { NavLink, Outlet, useNavigate,} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

const nav = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    to: "/dashboard/profile",
    label: "My Profile",
    icon: UserRound,
  },
  {
    to: "/dashboard/staff",
    label: "Staff",
    icon: ShieldCheck,
    roles: ["Admin"],
  },
  {
    to: "/dashboard/beneficiaries",
    label: "Beneficiaries",
    icon: HeartHandshake,
    roles: [
      "Admin",
      "Registration-Officer",
      "Distribution-Officer",
    ],
  },
  {
    to: "/dashboard/assistance",
    label: "Assistance",
    icon: ClipboardList,
    roles: [
      "Admin",
      "Registration-Officer",
      "Distribution-Officer",
    ],
  },
  {
    to: "/dashboard/members",
    label: "Members",
    icon: Users,
    roles: ["Admin"],
  },
  {
    to: "/dashboard/donations",
    label: "Donations",
    icon: HandCoins,
    roles: [
      "Admin",
      "Distribution-Officer",
    ],
  },
  {
    to: "/dashboard/resources",
    label: "Resources",
    icon: Boxes,
    roles: [
      "Admin",
      "Distribution-Officer",
    ],
  },
  {
    to: "/dashboard/distributions",
    label: "Distributions",
    icon: Truck,
    roles: [
      "Admin",
      "Distribution-Officer",
    ],
  },
  {
    to: "/dashboard/activities",
    label: "Activities",
    icon: Activity,
    roles: [
      "Admin",
      "Distribution-Officer",
    ],
  },
  {
    to: "/dashboard/content",
    label: "Public Content",
    icon: Newspaper,
    roles: ["Admin"],
  },
  {
    to: "/dashboard/annual-plans",
    label: "Annual Plans",
    icon: CalendarRange,
    roles: ["Admin"],
  },
  {
    to: "/dashboard/messages",
    label: "Messages",
    icon: MessageSquare,
    roles: ["Admin"],
  },
  {
    to: "/dashboard/reports",
    label: "Reports",
    icon: FileBarChart,
    roles: ["Admin"],
  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  async function signOut() {
    await logout();

    navigate("/login");
  }

  const visibleNav = nav.filter((item) => {
    return (
      !item.roles ||
      item.roles.includes(user?.role)
    );
  });

  return (
    <div className="dash-shell">
      <aside
        className={`sidebar ${
          open ? "sidebar-open" : ""
        }`}
      >
        <div className="side-brand">
          <Logo />

          <button
            type="button"
            className="mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <NavLink
          to="/dashboard/profile"
          className="side-user side-user-link"
          onClick={() => setOpen(false)}
        >
          {user?.profile_picture ? (
            <img
              className="avatar avatar-image"
              src={user.profile_picture}
              alt="Profile"
            />
          ) : (
            <div className="avatar">
              {user?.full_name?.[0] || "I"}
            </div>
          )}

          <div>
            <strong>
              {user?.full_name}
            </strong>

            <span>
              {user?.role?.replaceAll(
                "-",
                " "
              )}
            </span>
          </div>
        </NavLink>

        <nav className="side-nav">
          {visibleNav.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={
                  item.to === "/dashboard"
                }
                onClick={() =>
                  setOpen(false)
                }
              >
                <Icon size={18} />

                <span>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          className="side-logout"
          onClick={signOut}
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="dash-main">
        <div className="dash-topbar">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <div>
            <span>
              ISHRAQ MANAGEMENT SYSTEM
            </span>
          </div>

          <NavLink
            to="/"
            className="top-public"
          >
            Public website
          </NavLink>
        </div>

        <div className="dash-content">
          <Outlet />
        </div>
      </main>

      {open && (
        <div
          className="side-overlay"
          onClick={() =>
            setOpen(false)
          }
        />
      )}
    </div>
  );
}

