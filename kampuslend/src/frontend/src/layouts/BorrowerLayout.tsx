import { Button } from "@/components/ui/button";
/**
 * Layout utama untuk halaman Peminjam
 * Sidebar navy dengan navigasi dan header
 */
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { CreditCard, FileText, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  {
    to: "/borrower/dashboard" as const,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  { to: "/borrower/apply" as const, label: "Ajukan Pinjaman", icon: FileText },
  {
    to: "/borrower/repayment" as const,
    label: "Cicilan Saya",
    icon: CreditCard,
  },
];

export default function BorrowerLayout() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/" });
  };

  const currentPath = router.state.location.pathname;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-navy flex flex-col flex-shrink-0 h-full">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="font-bold text-xl text-white tracking-tight">
              KampusLend
            </span>
          </div>
          <p className="text-white/50 text-xs mt-1">Peminjam Dashboard</p>
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
                    ? "bg-amber-500 text-white"
                    : "text-white/70 hover:text-white hover:bg-sidebar-accent"
                }`}
                data-ocid={"borrower.nav_link"}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + Logout */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name}
              </p>
              <p className="text-white/50 text-xs">Peminjam</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-white/70 hover:text-white hover:bg-sidebar-accent rounded-xl px-3 text-sm"
            onClick={handleLogout}
            data-ocid="borrower.logout_button"
          >
            <LogOut size={16} className="mr-2" />
            Keluar
          </Button>
        </div>
      </aside>

      {/* Konten utama */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-border px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-bold text-foreground">Halo, {user?.name} 👋</h1>
            <p className="text-xs text-muted-foreground">
              KampusLend Peminjam Portal
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
