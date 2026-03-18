import { useNavigate } from "react-router-dom";
import { Mail, Users, Leaf, LogOut, Printer, ClipboardList } from "lucide-react";
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
];

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
