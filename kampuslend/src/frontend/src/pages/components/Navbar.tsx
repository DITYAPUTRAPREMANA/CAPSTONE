"use client";

import { Button } from "@/components/ui/button";
import logoSvg from "@/components/icon/logo.svg";

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  goTo: (path: string) => void;
  scrolled: boolean;
  visible: boolean;
}

const navLinkStyles = `
  .sodalis-nav-link {
    position: relative;
    transition: color 0.3s ease;
  }
  
  .sodalis-nav-link::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #1d6fbf;
    transition: width 0.3s ease;
  }
  
  .sodalis-nav-link:hover::after {
    width: 100%;
  }
`;

export default function Navbar({
  mobileMenuOpen,
  setMobileMenuOpen,
  goTo,
  scrolled,
  visible,
}: NavbarProps) {
  return (
    <>
      <style>{navLinkStyles}</style>
      <nav
        className={`navbar ${scrolled ? "scrolled" : ""} ${
          visible ? "show" : "hide"
        }`}
        style={{
          background: scrolled ? "rgba(255,255,255,0.72)" : "white",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
          padding: "14px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e8ecf0",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: scrolled
            ? "0 2px 16px rgba(0,0,0,0.08)"
            : "0 1px 8px rgba(0,0,0,0.06)",
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          transition:
            "transform 0.35s cubic-bezier(0.4,0,0.2,1), background 0.3s ease, box-shadow 0.3s ease",
        }}
      >
        <div
          className="logo"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <img
            src={logoSvg}
            alt="Sodalis logo"
            style={{ width: 34, height: 34, objectFit: "contain" }}
          />
          <span
            style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a3a5c" }}
          >
            Sodalis.
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links hidden md:flex items-center gap-6 text-sm">
          <a
            href="#cara-kerja"
            className="sodalis-nav-link"
            style={{
              color: "#1a3a5c",
              fontWeight: 500,
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            How it Works
          </a>
          <a
            href="#fitur"
            className="sodalis-nav-link"
            style={{
              color: "#1a3a5c",
              fontWeight: 500,
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            Features
          </a>
        </div>

        {/* Desktop Buttons */}
        <div className="nav-buttons hidden md:flex items-center gap-3">
          <Button
            className="sodalis-nav-btn"
            variant="outline"
            style={{
              borderRadius: "999px",
              color: "#1d6fbf",
              borderColor: "#1d6fbf",
              fontSize: "0.88rem",
            }}
            onClick={() => goTo("/login")}
          >
            Sign In
          </Button>
          <Button
            className="sodalis-nav-btn"
            style={{
              borderRadius: "999px",
              background: "#1d6fbf",
              color: "white",
              fontSize: "0.88rem",
            }}
            onClick={() => goTo("/register")}
            data-ocid="nav.register_button"
          >
            Register
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div
            style={{
              transform: mobileMenuOpen
                ? "rotate(45deg) translate(6px, 6px)"
                : "none",
            }}
          ></div>
          <div
            style={{
              opacity: mobileMenuOpen ? "0" : "1",
            }}
          ></div>
          <div
            style={{
              transform: mobileMenuOpen
                ? "rotate(-45deg) translate(6px, -6px)"
                : "none",
            }}
          ></div>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div>
            <a href="#cara-kerja" onClick={() => setMobileMenuOpen(false)}>
              How it Works
            </a>
            <a href="#fitur" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>

            <div className="nav-buttons">
              <Button
                className="sodalis-nav-btn"
                variant="outline"
                style={{
                  borderRadius: "999px",
                  border: "1.5px solid #1a3a5c",
                  color: "#1a3a5c",
                  background: "transparent",
                }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  goTo("/login");
                }}
              >
                Login
              </Button>

              <Button
                className="sodalis-nav-btn"
                style={{
                  borderRadius: "999px",
                  background: "#1d6fbf",
                  color: "white",
                }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  goTo("/register");
                }}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
