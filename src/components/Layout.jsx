import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight, Flower2 } from "lucide-react";
import Logo from "./Logo.jsx";
import MiniTimer from "./MiniTimer.jsx";
import PetalField from "./PetalField.jsx";
import navItems from "./navItems.js";
import useLocalStorage from "../hooks/useLocalStorage.js";

const isMouse = (e) => e.pointerType === "mouse";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [petalsOn, setPetalsOn] = useLocalStorage("pp:petals", true);
  const timer = useRef(null);
  const { pathname } = useLocation();

  // Fewer, fainter petals while she is reading a lesson or taking a quiz
  const calm = pathname.startsWith("/library/") || pathname.startsWith("/quizzes");

  function cancelClose() {
    clearTimeout(timer.current);
  }
  function openMenu() {
    cancelClose();
    setOpen(true);
  }
  function closeMenu() {
    cancelClose();
    setOpen(false);
  }
  function closeSoon(delay) {
    cancelClose();
    timer.current = setTimeout(() => setOpen(false), delay);
  }

  // Escape closes the menu
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeMenu();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="app-shell">
      <button
        type="button"
        className="skip-link"
        onClick={() => document.getElementById("main")?.focus()}
      >
        Skip to content
      </button>

      {/* Falling petals, drawn behind clicks and taps */}
      <PetalField enabled={petalsOn} calm={calm} />

      {/* Top bar (phones, tablets and touch screens only) */}
      <header className="topbar">
        <Logo size={32} showText={false} />
        <span className="topbar-title">Petal &amp; Pulse</span>
        <button className="btn btn-soft btn-icon" onClick={openMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>
      </header>

      {/* Dark overlay behind the open mobile menu */}
      {open && <div className="scrim" onClick={closeMenu} />}

      {/* The hover area on the left edge (mouse devices only) */}
      <div
        className={`edge-zone ${open ? "is-open" : ""}`}
        onPointerEnter={(e) => isMouse(e) && openMenu()}
        onPointerLeave={(e) => isMouse(e) && closeSoon(650)}
        aria-hidden="true"
      >
        <span className="edge-handle">
          <ChevronRight size={14} />
        </span>
      </div>

      {/* Sidebar: hidden until the mouse reaches the edge, or the menu button is tapped */}
      <aside
        className={`sidebar ${open ? "open" : ""}`}
        onPointerEnter={(e) => isMouse(e) && openMenu()}
        onPointerLeave={(e) => isMouse(e) && closeSoon(300)}
        onFocus={(e) => {
          // Keyboard users: tabbing into the menu opens it
          if (e.target.matches && e.target.matches(":focus-visible")) openMenu();
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) closeSoon(150);
        }}
      >
        <div className="sidebar-head">
          <Logo />
          <button
            className="btn btn-outline btn-icon sidebar-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon, end }, i) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={{ "--i": i }}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={closeMenu}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <button
            className="petal-toggle"
            onClick={() => setPetalsOn(!petalsOn)}
            aria-pressed={petalsOn}
          >
            <Flower2 size={18} /> Falling petals: {petalsOn ? "On" : "Off"}
          </button>
          <p className="muted small" style={{ margin: 0 }}>
            Made with love, for you. 💗
          </p>
        </div>
      </aside>

      {/* Page content */}
      <main className="main" id="main" tabIndex={-1}>
        <div className="page">
          <MiniTimer />
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
