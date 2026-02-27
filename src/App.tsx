import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Documents from "./pages/Documents";
import Soumission from "./pages/Soumission";
import Facture from "./pages/Facture";
import Contrat from "./pages/Contrat";
import EmailTemplates from "./pages/EmailTemplates";
import Clients from "./pages/Clients";
import RunGazon from "./pages/RunGazon";
import Publicite from "./pages/Publicite";
import Depenses from "./pages/Depenses";
import Agenda from "./pages/Agenda";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/soumission" element={<Soumission />} />
      <Route path="/facture" element={<Facture />} />
      <Route path="/contrat" element={<Contrat />} />
      <Route path="/courriels" element={<EmailTemplates />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/run-gazon" element={<RunGazon />} />
      <Route path="/publicite" element={<Publicite />} />
      <Route path="/depenses" element={<Depenses />} />
      <Route path="/agenda" element={<Agenda />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AuthRoute = () => {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/" replace />;
  return <Auth />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
