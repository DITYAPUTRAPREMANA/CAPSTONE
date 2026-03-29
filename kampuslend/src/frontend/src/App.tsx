import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
/**
 * Komponen utama App - routing dan provider untuk KampusLend
 * Menggunakan @tanstack/react-router
 */
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useActor } from "./hooks/useActor";

// Halaman
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Layout dan halaman investor
import InvestorLayout from "./layouts/InvestorLayout";
import InvestorBrowse from "./pages/investor/Browse";
import InvestorDashboard from "./pages/investor/Dashboard";
import InvestorLoanDetail from "./pages/investor/LoanDetail";
import InvestorPortfolio from "./pages/investor/Portfolio";

// Layout dan halaman peminjam
import BorrowerLayout from "./layouts/BorrowerLayout";
import BorrowerApply from "./pages/borrower/Apply";
import BorrowerDashboard from "./pages/borrower/Dashboard";
import BorrowerRepayment from "./pages/borrower/Repayment";

const queryClient = new QueryClient();

/** Komponen pemuat seed data */
function SeedLoader() {
  const { actor } = useActor();
  useEffect(() => {
    if (!actor) return;
    const seeded = localStorage.getItem("kampuslend_seeded");
    if (!seeded) {
      actor
        .addSeedData()
        .then(() => localStorage.setItem("kampuslend_seeded", "true"))
        .catch(() => {});
    }
  }, [actor]);
  return null;
}

/** Root layout - provider + outlet */
function RootLayout() {
  return (
    <>
      <SeedLoader />
      <Outlet />
      <Toaster position="top-right" richColors />
    </>
  );
}

/** Komponen redirect berdasarkan status login */
function HomeRedirect() {
  const { user } = useAuth();
  const navigate = rootRoute.useNavigate();

  useEffect(() => {
    if (user) {
      navigate({
        to:
          user.role === "Investor"
            ? "/investor/dashboard"
            : "/borrower/dashboard",
      });
    }
  }, [user, navigate]);

  if (user) return null;
  return <LandingPage />;
}

/** Wrapper layout investor dengan pengecekan auth */
function InvestorLayoutWrapper() {
  const { user } = useAuth();
  const navigate = rootRoute.useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "Investor") navigate({ to: "/borrower/dashboard" });
  }, [user, navigate]);

  if (!user || user.role !== "Investor") return null;
  return <InvestorLayout />;
}

/** Wrapper layout peminjam dengan pengecekan auth */
function BorrowerLayoutWrapper() {
  const { user } = useAuth();
  const navigate = rootRoute.useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "Peminjam") navigate({ to: "/investor/dashboard" });
  }, [user, navigate]);

  if (!user || user.role !== "Peminjam") return null;
  return <BorrowerLayout />;
}

// ===== Definisi Route =====

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeRedirect,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
});

// Route investor
const investorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/investor",
  component: InvestorLayoutWrapper,
});

const investorIndexRoute = createRoute({
  getParentRoute: () => investorRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/investor/dashboard" });
  },
});

const investorDashboardRoute = createRoute({
  getParentRoute: () => investorRoute,
  path: "/dashboard",
  component: InvestorDashboard,
});

const investorBrowseRoute = createRoute({
  getParentRoute: () => investorRoute,
  path: "/browse",
  component: InvestorBrowse,
});

const investorLoanDetailRoute = createRoute({
  getParentRoute: () => investorRoute,
  path: "/loan/$id",
  component: InvestorLoanDetail,
});

const investorPortfolioRoute = createRoute({
  getParentRoute: () => investorRoute,
  path: "/portfolio",
  component: InvestorPortfolio,
});

// Route peminjam
const borrowerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/borrower",
  component: BorrowerLayoutWrapper,
});

const borrowerIndexRoute = createRoute({
  getParentRoute: () => borrowerRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/borrower/dashboard" });
  },
});

const borrowerDashboardRoute = createRoute({
  getParentRoute: () => borrowerRoute,
  path: "/dashboard",
  component: BorrowerDashboard,
});

const borrowerApplyRoute = createRoute({
  getParentRoute: () => borrowerRoute,
  path: "/apply",
  component: BorrowerApply,
});

const borrowerRepaymentRoute = createRoute({
  getParentRoute: () => borrowerRoute,
  path: "/repayment",
  component: BorrowerRepayment,
});

// Buat pohon route dan router
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  investorRoute.addChildren([
    investorIndexRoute,
    investorDashboardRoute,
    investorBrowseRoute,
    investorLoanDetailRoute,
    investorPortfolioRoute,
  ]),
  borrowerRoute.addChildren([
    borrowerIndexRoute,
    borrowerDashboardRoute,
    borrowerApplyRoute,
    borrowerRepaymentRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}
