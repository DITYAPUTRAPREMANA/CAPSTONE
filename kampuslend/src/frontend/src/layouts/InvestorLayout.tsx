import { Button } from "@/components/ui/button";
/**
 * Layout utama untuk halaman Investor
 * Sidebar navy dengan navigasi dan header
 */
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { Briefcase, LayoutDashboard, LogOut, Search } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoSvg from "@/components/icon/logo.svg";

const navItems = [
  {
    to: "/investor/dashboard" as const,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  { to: "/investor/browse" as const, label: "Browse Borrowers", icon: Search },
  { to: "/investor/portfolio" as const, label: "Portfolio", icon: Briefcase },
];

export default function InvestorLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/" });
  };

  // Dapatkan path saat ini untuk highlight aktif
  const currentPath = router.state.location.pathname;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#e8eef3", fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col flex-shrink-0 h-full" style={{ backgroundColor: "#1a3a5c" }}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img src={logoSvg} alt="Sodalis logo" style={{ width: 34, height: 34, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            <span className="font-bold text-xl text-white tracking-tight">
              Sodalis.
            </span>
          </div>
          <p className="text-white/50 text-xs mt-1">Investor Dashboard</p>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              currentPath === to || currentPath.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
                style={{ backgroundColor: isActive ? "#1d6fbf" : "transparent" }}
                data-ocid={"investor.nav_link"}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: "#1d6fbf" }}>
              {user?.name?.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name}
              </p>
              <p className="text-white/50 text-xs">Investor</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/5 rounded-xl px-3 text-sm transition-colors"
            onClick={handleLogout}
            data-ocid="investor.logout_button"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Konten utama */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white px-8 py-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid #d0dbe5" }}>
          <div>
            <h1 className="font-bold text-xl" style={{ color: "#1a3a5c" }}>
              Welcome, {user?.name} 👋
            </h1>
            <p className="text-xs" style={{ color: "#7a9ab5" }}>
              SODALIS Investor Portal
            </p>
          </div>
        </header>

        {/* Isi halaman */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
