import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Contexts
import { AuthProvider } from "@/contexts/AuthContext";
import { TicketProvider } from "@/contexts/TicketContext";

// Layout
import { AuthLayout } from "@/components/layout/AuthLayout";

// Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import TicketListPage from "@/pages/tickets/TicketListPage";
import CreateTicketPage from "@/pages/tickets/CreateTicketPage";
import TicketDetailPage from "@/pages/tickets/TicketDetailPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <TicketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes (wrapped by AuthLayout which redirects if not authed) */}
              <Route element={<AuthLayout />}>
                <Route path="/dashboard"     element={<DashboardPage />} />
                <Route path="/tickets"       element={<TicketListPage />} />
                <Route path="/my-tickets"    element={<TicketListPage myTickets />} />
                <Route path="/tickets/new"   element={<CreateTicketPage />} />
                <Route path="/tickets/:id"   element={<TicketDetailPage />} />
              </Route>

              {/* Default redirect */}
              <Route path="/"  element={<Navigate to="/dashboard" replace />} />
              <Route path="*"  element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TicketProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
