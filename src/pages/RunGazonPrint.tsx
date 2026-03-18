import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import logoEmj from "@/assets/logo-emj.png";
import { companyInfo } from "@/lib/companyInfo";

const ROWS = 25;

const RunGazonPrint = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <h1 className="text-sm font-bold text-foreground">Feuille de Run — Impression</h1>
        <Button size="sm" onClick={() => window.print()} className="ml-auto gap-1">
          <Printer className="h-4 w-4" /> Imprimer
        </Button>
      </div>

      <div className="p-4 sm:p-8">
        <div className="print-page bg-white text-black p-6 max-w-[8.5in] mx-auto border border-border rounded-lg print:border-none print:rounded-none print:p-[0.3in]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <img src={logoEmj} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
            <div>
              <h2 className="text-sm font-bold">{companyInfo.name}</h2>
              <p className="text-[10px] text-gray-500">{companyInfo.subtitle}</p>
            </div>
            <div className="ml-auto text-right text-xs text-gray-500">
              <p className="font-semibold text-sm text-black">RUN DE GAZON</p>
              <p>Date: _______________</p>
            </div>
          </div>

          <hr className="border-t-2 border-blue-500 mb-3" />

          {/* Table */}
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="p-1.5 border border-blue-500 text-center w-10">Fait</th>
                <th className="p-1.5 border border-blue-500 text-left" style={{ width: "20%" }}>Nom</th>
                <th className="p-1.5 border border-blue-500 text-left" style={{ width: "25%" }}>Adresse</th>
                <th className="p-1.5 border border-blue-500 text-left" style={{ width: "14%" }}>Ville</th>
                <th className="p-1.5 border border-blue-500 text-left" style={{ width: "14%" }}>Téléphone</th>
                <th className="p-1.5 border border-blue-500 text-left">Remarque</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS }).map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="p-1 border border-gray-200 h-[22px] text-center">
                    <span className="inline-block w-3 h-3 border border-gray-400 rounded-sm" />
                  </td>
                  <td className="p-1 border border-gray-200 h-[22px]">&nbsp;</td>
                  <td className="p-1 border border-gray-200 h-[22px]">&nbsp;</td>
                  <td className="p-1 border border-gray-200 h-[22px]">&nbsp;</td>
                  <td className="p-1 border border-gray-200 h-[22px]">&nbsp;</td>
                  <td className="p-1 border border-gray-200 h-[22px]">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-gray-200 text-center text-[9px] text-gray-400">
            {companyInfo.name} — {companyInfo.phone} — {companyInfo.email}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunGazonPrint;
