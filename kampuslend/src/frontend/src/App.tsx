import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
/**
 * Main App component - routing and providers for SODALIS
 * Uses @tanstack/react-router
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


// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";

// Investor layout and pages
import InvestorLayout from "./layouts/InvestorLayout";
import InvestorBrowse from "./pages/investor/Browse";
import InvestorDashboard from "./pages/investor/Dashboard";
import InvestorLoanDetail from "./pages/investor/LoanDetail";
import InvestorPortfolio from "./pages/investor/Portfolio";

// Borrower layout and pages
import BorrowerLayout from "./layouts/BorrowerLayout";
import BorrowerApply from "./pages/borrower/Apply";
import BorrowerDashboard from "./pages/borrower/Dashboard";
import BorrowerRepayment from "./pages/borrower/Repayment";
import { useActor } from "./hooks/useActor";

const queryClient = new QueryClient();

/** Seed data loader component */
function SeedLoader() {
  const { actor } = useActor();
  useEffect(() => {
    if (!actor) return;
    const seeded = localStorage.getItem("sodalis_seeded");
    if (!seeded) {
      actor
        .addSeedData()
        .then(() => localStorage.setItem("sodalis_seeded", "true"))
        .catch(() => { });
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

/** Redirect component based on login status */
function HomeRedirect() {
  const { user } = useAuth();
  const navigate = rootRoute.useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "Investor") navigate({ to: "/investor/dashboard" });
      else navigate({ to: "/borrower/dashboard" });
    }
  }, [user, navigate]);

  if (user) return null;
  return <LandingPage />;
}

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

function BorrowerLayoutWrapper() {
  const { user } = useAuth();
  const navigate = rootRoute.useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (user.role !== "Borrower") navigate({ to: "/investor/dashboard" });
  }, [user, navigate]);

  if (!user || user.role !== "Borrower") return null;
  return <BorrowerLayout />;
}

// ===== Route Definitions =====

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

const verifyOtpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify-otp",
  component: OtpVerificationPage,
  validateSearch: (search: Record<string, unknown>) => ({
    userId: String(search.userId ?? ""),
    role: String(search.role ?? ""),
    name: String(search.name ?? ""),
  }),
});

// Investor routes
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

// Borrower routes
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

// Create route tree and router
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  verifyOtpRoute,
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
