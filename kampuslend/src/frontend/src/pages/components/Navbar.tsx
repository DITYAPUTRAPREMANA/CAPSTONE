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

export default function Navbar({
  mobileMenuOpen,
  setMobileMenuOpen,
  goTo,
  scrolled,
  visible,
}: NavbarProps) {

  return (
    <>
      <nav
        className={`navbar ${scrolled ? "scrolled" : ""} ${
          visible ? "show" : "hide"
        }`}
      >
        <div className="logo">
          <img src={logoSvg} alt="Sodalis logo" />
          <span>Sodalis.</span>
        </div>

        {/* Desktop Navigation */}
        <div className="nav-links md:flex items-center gap-6 text-sm">
          <a href="#cara-kerja">How it Works</a>
          <a href="#fitur">Features</a>
        </div>

        {/* Desktop Buttons */}
        <div className="nav-buttons md:flex items-center gap-3">
          <Button
            className="sodalis-nav-btn"
            variant="outline"
            style={{
              borderRadius: "999px",
              border: "1.5px solid #1a3a5c",
              color: "#1a3a5c",
              background: "transparent",
            }}
            onClick={() => goTo("/login")}
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
            onClick={() => goTo("/register")}
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