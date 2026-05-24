import { Button } from "@/components/ui/button";
/**
 * Layout utama untuk halaman Peminjam
 * Sidebar biru tua dengan navigasi dan header
 */
import { Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import { CreditCard, FileText, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoSvg from "@/components/icon/logo.svg";
import { useState, useEffect } from "react";
import { useIsMobile } from "../hooks/use-mobile";
import PageTransition from "../components/PageTransition";

const navItems = [
  {
    to: "/borrower/dashboard" as const,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  { to: "/borrower/apply" as const, label: "Apply", icon: FileText },
  {
    to: "/borrower/repayment" as const,
    label: "Payments",
    icon: CreditCard,
  },
];

export default function BorrowerLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/" });
  };

  // Dapatkan path saat ini secara reaktif untuk highlight aktif
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  // Tutup sidebar saat pindah halaman di mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentPath]);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoSvg} alt="Sodalis logo" style={{ width: 34, height: 34, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          <span className="font-bold text-xl text-white tracking-tight">
            Sodalis.
          </span>
        </div>
        {isMobile && (
          <button onClick={() => setIsSidebarOpen(false)} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigasi */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive =
            currentPath === to || currentPath.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                ? "text-white"
                : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
              style={{ backgroundColor: isActive ? "#1d6fbf" : "transparent" }}
              data-ocid={"borrower.nav_link"}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="px-4 py-4 border-t border-white/10 mt-auto">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: "#1d6fbf" }}>
            {user?.name?.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.name}
            </p>
            <p className="text-white/50 text-xs text-nowrap">Borrower Account</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-white/70 hover:text-white rounded-xl px-3 text-sm transition-colors"
          style={{ ":hover": { backgroundColor: "rgba(255,255,255,0.05)" } } as React.CSSProperties}
          onClick={handleLogout}
          data-ocid="borrower.logout_button"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#e8eef3]" style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 flex flex-col flex-shrink-0 h-full desktop-sidebar" style={{ backgroundColor: "#1a3a5c" }}>
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <>
          <div 
            className={`mobile-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
            onClick={() => setIsSidebarOpen(false)}
          />
          <aside className={`mobile-sidebar-panel ${isSidebarOpen ? 'open' : ''}`} style={{ backgroundColor: "#1a3a5c" }}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Konten utama */}
      <main className="flex-1 flex flex-col overflow-hidden main-content-area">
        {/* Header */}
        <header className="bg-white px-4 md:px-8 py-3 md:py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid #d0dbe5" }}>
          <div className="flex items-center gap-3">
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="p-1 text-[#1a3a5c]"
              >
                <Menu size={24} />
              </button>
            )}
            <div>
              <h1 className="font-bold text-base md:text-xl leading-tight" style={{ color: "#1a3a5c" }}>
                {isMobile ? `Hello, ${user?.name?.split(' ')[0]}` : `Hello, ${user?.name} 👋`}
              </h1>
              <p className="text-[10px] md:text-xs" style={{ color: "#7a9ab5" }}>
                SODALIS Borrower Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold flex-shrink-0" style={{ backgroundColor: "#1d6fbf" }}>
              {user?.name?.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Isi halaman */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="mobile-bottom-nav">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = currentPath === to || currentPath.startsWith(`${to}/`);
              return (
                <Link
                  key={to}
                  to={to}
                  className={isActive ? "active" : ""}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </main>
    </div>
  );
}
