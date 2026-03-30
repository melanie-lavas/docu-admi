import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Mail, Users, Leaf, LogOut, Printer, ClipboardList, ShieldCheck, Package, FileCheck, DollarSign, CalendarCheck, Clock } from "lucide-react";
import logoEmj from "@/assets/logo-emj.png";
import { companyInfo } from "@/lib/companyInfo";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const sections = [
  {
    title: "Documents vierges",
    description: "Soumission, facture et contrat vierges à imprimer",
    icon: Printer,
    path: "/documents-vierges",
  },
  {
    title: "Gestion Clients",
    description: "Fiches clients, runs, paiements et contrats",
    icon: Users,
    path: "/clients",
  },
  {
    title: "Run de Gazon",
    description: "Liste des clients pour la tonte avec suivi",
    icon: Leaf,
    path: "/run-gazon",
  },
  {
    title: "Feuille de Run (impression)",
    description: "Feuille vierge avec colonnes à imprimer",
    icon: ClipboardList,
    path: "/run-gazon-print",
  },
  {
    title: "Templates Courriel",
    description: "Réponses pré-faites à copier-coller",
    icon: Mail,
    path: "/courriels",
  },
  {
    title: "Décharge légale",
    description: "Formulaire de décharge pour émondage/élagage",
    icon: ShieldCheck,
    path: "/decharge",
  },
  {
    title: "Banque de services",
    description: "Gérer les services et prix pré-enregistrés",
    icon: Package,
    path: "/services",
  },
];

interface DashboardStats {
  totalClients: number;
  contractsSigned: number;
  contractsUnsigned: number;
  paymentsPaid: number;
  paymentsPartial: number;
  paymentsWaiting: number;
  totalRevenue: number;
  totalPaid: number;
  upcomingRuns: { client_name: string; run_date: string }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [clientsRes, paymentsRes, runsRes] = await Promise.all([
        supabase.from("clients").select("id, name, contract_status, payment_status"),
        supabase.from("client_payments").select("amount"),
        supabase.from("client_runs").select("client_id, run_date, completed").eq("completed", false).order("run_date", { ascending: true }).limit(5),
      ]);

      const clients = clientsRes.data || [];
      const payments = paymentsRes.data || [];
      const runs = runsRes.data || [];

      // Get client names for upcoming runs
      const clientIds = [...new Set(runs.map(r => r.client_id))];
      let clientMap: Record<string, string> = {};
      if (clientIds.length > 0) {
        const { data: runClients } = await supabase.from("clients").select("id, name").in("id", clientIds);
        if (runClients) {
          clientMap = Object.fromEntries(runClients.map(c => [c.id, c.name]));
        }
      }

      // Get total invoiced from documents
      const { data: docs } = await supabase.from("client_documents").select("amount");
      const totalRevenue = (docs || []).reduce((s, d) => s + Number(d.amount || 0), 0);

      setStats({
        totalClients: clients.length,
        contractsSigned: clients.filter(c => c.contract_status === "signe").length,
        contractsUnsigned: clients.filter(c => c.contract_status !== "signe").length,
        paymentsPaid: clients.filter(c => c.payment_status === "paye").length,
        paymentsPartial: clients.filter(c => c.payment_status === "partiel").length,
        paymentsWaiting: clients.filter(c => c.payment_status === "en_attente").length,
        totalRevenue,
        totalPaid: payments.reduce((s, p) => s + Number(p.amount), 0),
        upcomingRuns: runs.map(r => ({ client_name: clientMap[r.client_id] || "—", run_date: r.run_date })),
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse h-20" />
      ))}
    </div>
  );

  if (!stats || stats.totalClients === 0) return null;

  const balance = stats.totalRevenue - stats.totalPaid;

  return (
    <div className="mb-6 space-y-4">
      <h2 className="text-base font-display font-bold text-foreground">Tableau de bord</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Contrats signés</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.contractsSigned}<span className="text-sm font-normal text-muted-foreground">/{stats.totalClients}</span></p>
          {stats.contractsUnsigned > 0 && (
            <p className="text-xs text-destructive mt-0.5">{stats.contractsUnsigned} non signé{stats.contractsUnsigned > 1 ? "s" : ""}</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Paiements</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.paymentsPaid}<span className="text-sm font-normal text-muted-foreground">/{stats.totalClients}</span></p>
          <div className="flex gap-2 text-xs mt-0.5">
            {stats.paymentsPartial > 0 && <span className="text-amber-500">{stats.paymentsPartial} partiel{stats.paymentsPartial > 1 ? "s" : ""}</span>}
            {stats.paymentsWaiting > 0 && <span className="text-destructive">{stats.paymentsWaiting} en attente</span>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Revenus reçus</span>
          </div>
          <p className="text-lg font-bold text-primary">{stats.totalPaid.toFixed(2)} $</p>
          <p className="text-xs text-muted-foreground">sur {stats.totalRevenue.toFixed(2)} $ facturé</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Solde à recevoir</span>
          </div>
          <p className={`text-lg font-bold ${balance > 0 ? "text-destructive" : "text-primary"}`}>
            {balance.toFixed(2)} $
          </p>
        </div>
      </div>

      {/* Upcoming runs */}
      {stats.upcomingRuns.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Prochains passages</span>
          </div>
          <div className="space-y-1">
            {stats.upcomingRuns.map((run, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-foreground">{run.client_name}</span>
                <span className="text-muted-foreground">{run.run_date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="document-header-gradient py-10 px-6 text-center relative">
        <Button
          size="sm"
          variant="ghost"
          className="absolute top-3 right-3 text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
          onClick={async () => {
            await supabase.auth.signOut();
            toast.success("Déconnexion réussie");
            navigate("/auth");
          }}
        >
          <LogOut className="h-4 w-4 mr-1" /> Déconnexion
        </Button>
        <img src={logoEmj} alt="Logo E.M.J" className="w-20 h-20 rounded-xl mx-auto mb-3 object-cover shadow-lg" />
        <h1 className="text-2xl font-display font-bold text-primary-foreground">
          {companyInfo.name}
        </h1>
        <p className="text-primary-foreground/80 text-sm mt-1">{companyInfo.subtitle}</p>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full p-6">
        <Dashboard />

        <h2 className="text-base font-display font-bold text-foreground mb-4">
          Gestion de l'entreprise
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sections.map((s) => (
            <button
              key={s.path}
              onClick={() => navigate(s.path)}
              className="group bg-card border border-border rounded-xl p-5 text-left hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <div className="document-header-gradient w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground text-sm mb-0.5">{s.title}</h3>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">{companyInfo.owner}, {companyInfo.title}</p>
          <p>{companyInfo.phone} — {companyInfo.email} — N.E.Q. {companyInfo.neq}</p>
        </div>
      </main>
    </div>
  );
};

export default Index;
