import { useNavigate } from "react-router-dom";
import { FileText, Receipt, ScrollText, Mail, Users } from "lucide-react";
import logoEmj from "@/assets/logo-emj.png";
import { companyInfo } from "@/lib/companyInfo";

const documentTypes = [
  {
    title: "Soumission",
    description: "Estimation de prix pour un client potentiel",
    icon: FileText,
    path: "/soumission",
  },
  {
    title: "Facture",
    description: "Document de facturation avec taxes (TPS/TVQ)",
    icon: Receipt,
    path: "/facture",
  },
  {
    title: "Contrat de Service",
    description: "Entente de services avec termes et conditions",
    icon: ScrollText,
    path: "/contrat",
  },
  {
    title: "Templates Courriel",
    description: "Réponses pré-faites à copier-coller",
    icon: Mail,
    path: "/courriels",
  },
  {
    title: "Gestion Clients",
    description: "Fiches clients, runs, paiements et contrats",
    icon: Users,
    path: "/clients",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <header className="document-header-gradient py-12 px-6 text-center">
        <img src={logoEmj} alt="Logo E.M.J" className="w-24 h-24 rounded-xl mx-auto mb-4 object-cover shadow-lg" />
        <h1 className="text-3xl font-display font-bold text-primary-foreground">
          {companyInfo.name}
        </h1>
        <p className="text-primary-foreground/80 mt-1">{companyInfo.subtitle}</p>
        <p className="text-primary-foreground/60 text-sm mt-2">
          Générateur de documents légaux
        </p>
      </header>

      {/* Document Cards */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-8">
        <h2 className="text-lg font-display font-bold text-foreground mb-6">
          Choisissez une section
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {documentTypes.map((doc) => (
            <button
              key={doc.path}
              onClick={() => navigate(doc.path)}
              className="group bg-card border border-border rounded-xl p-6 text-left hover:border-primary hover:shadow-lg transition-all duration-200"
            >
              <div className="document-header-gradient w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <doc.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-foreground text-lg mb-1">{doc.title}</h3>
              <p className="text-sm text-muted-foreground">{doc.description}</p>
            </button>
          ))}
        </div>

        {/* Company Info */}
        <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">{companyInfo.owner}, {companyInfo.title}</p>
          <p>{companyInfo.phone} — {companyInfo.email} — N.E.Q. {companyInfo.neq}</p>
        </div>
      </main>
    </div>
  );
};

export default Index;
