import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileText, Receipt, ScrollText } from "lucide-react";
import { companyInfo } from "@/lib/companyInfo";
import logoEmj from "@/assets/logo-emj.png";

type DocType = "soumission" | "facture" | "contrat";

const docConfig: Record<DocType, { label: string; icon: typeof FileText }> = {
  soumission: { label: "Soumission", icon: FileText },
  facture: { label: "Facture", icon: Receipt },
  contrat: { label: "Contrat de Service", icon: ScrollText },
};

const BlankDocument = ({ type }: { type: DocType }) => {
  const { label } = docConfig[type];
  const showTaxes = type === "facture";

  return (
    <div className="print-page bg-white text-black p-8 max-w-[8.5in] mx-auto border border-border rounded-lg mb-6 print:border-none print:rounded-none print:mb-0 print:p-[0.3in]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={logoEmj} alt="Logo" className="w-14 h-14 rounded-lg object-cover" />
          <div>
            <h2 className="text-lg font-bold">{companyInfo.name}</h2>
            <p className="text-xs text-gray-600">{companyInfo.subtitle}</p>
            <p className="text-xs text-gray-500">{companyInfo.owner} — {companyInfo.phone}</p>
            <p className="text-xs text-gray-500">{companyInfo.email} | NEQ: {companyInfo.neq}</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p className="font-semibold text-sm text-black">{label.toUpperCase()}</p>
          <p className="mt-1">N° ___________</p>
          <p>Date: ___________</p>
        </div>
      </div>

      <hr className="border-t-2 border-blue-500 mb-4" />

      {/* Client info */}
      <div className="border border-gray-200 rounded p-3 mb-4 bg-gray-50">
        <p className="text-xs font-bold mb-2 uppercase text-gray-600">Client</p>
        <div className="grid grid-cols-2 gap-y-3 text-xs">
          <div>Nom: ___________________________________</div>
          <div>Tél: ___________________________________</div>
          <div>Adresse: ___________________________________</div>
          <div>Courriel: ___________________________________</div>
          <div>Ville: ___________________________________</div>
        </div>
      </div>

      {/* Services checklist */}
      {type !== "facture" && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase text-gray-600 mb-2">Services</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {companyInfo.services.map((s) => (
              <label key={s} className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border border-gray-400 rounded-sm flex-shrink-0" />
                {s}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Line items table */}
      <div className="mb-4">
        <p className="text-xs font-bold uppercase text-gray-600 mb-2">Description des travaux</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="text-left p-1.5 border border-blue-500">Description</th>
              <th className="text-center p-1.5 border border-blue-500 w-16">Qté</th>
              <th className="text-right p-1.5 border border-blue-500 w-24">Prix unit.</th>
              <th className="text-right p-1.5 border border-blue-500 w-24">Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="p-1.5 border border-gray-200 h-6">&nbsp;</td>
                <td className="p-1.5 border border-gray-200 h-6">&nbsp;</td>
                <td className="p-1.5 border border-gray-200 h-6">&nbsp;</td>
                <td className="p-1.5 border border-gray-200 h-6">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mt-2">
          <div className="w-48 text-xs space-y-1">
            <div className="flex justify-between border-t border-gray-300 pt-1">
              <span>Sous-total</span>
              <span>___________</span>
            </div>
            {showTaxes && (
              <>
                <div className="flex justify-between">
                  <span>TPS (5%)</span>
                  <span>___________</span>
                </div>
                <div className="flex justify-between">
                  <span>TVQ (9,975%)</span>
                  <span>___________</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-bold border-t border-gray-400 pt-1">
              <span>TOTAL</span>
              <span>___________</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contrat: montant convenu & clauses */}
      {type === "contrat" && (
        <>
          <div className="mb-3 text-xs">
            <p className="font-bold uppercase text-gray-600 mb-1">Montant convenu: ___________________ $</p>
          </div>
          <div className="mb-3 text-xs">
            <p className="font-bold uppercase text-gray-600 mb-1">Période du contrat</p>
            <p className="font-semibold">Du 1er mai 2026 au 15 octobre 2026 — 22 passages assurés.</p>
            <p className="mt-0.5">Entretien hebdomadaire sauf en cas d'urgence météo.</p>
          </div>
          <div className="mb-3 text-xs">
            <p className="font-bold uppercase text-gray-600 mb-1">Options de paiement</p>
            <div className="space-y-1">
              <label className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border border-gray-400 rounded-sm flex-shrink-0" />
                Option A — Paiement intégral avant le 1er mai 2026
              </label>
              <label className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 border border-gray-400 rounded-sm flex-shrink-0" />
                Option B — 2 versements égaux (15 avril 2026 et 15 août 2026)
              </label>
            </div>
          </div>
          <div className="mb-3 text-xs">
            <p className="font-bold uppercase text-gray-600 mb-1">Clauses du contrat</p>
            <ol className="list-decimal list-inside space-y-0.5 text-[10px] leading-tight">
              <li>L'entrepreneur se réserve le droit de mettre fin au contrat sans préavis en cas de manque de respect ou de non-paiement.</li>
              <li>L'entrepreneur n'est pas responsable des conditions météorologiques. En cas de pluie pendant trois jours consécutifs ou plus, il fera de son mieux malgré le retard.</li>
              <li>Le gazon sera coupé à une hauteur de 3,5 pouces (1 à 2 passages selon les besoins).</li>
              <li>Le client dispose de 24 heures après le service pour signaler toute insatisfaction.</li>
              <li>Tout travail additionnel non prévu au contrat fera l'objet d'une soumission séparée.</li>
            </ol>
          </div>
          <div className="mb-3 border border-red-200 bg-red-50 rounded p-2 text-[10px]">
            <p className="font-semibold text-red-600">⚠️ Important</p>
            <p>Vous devez retourner le contrat signé avant le début des services. Un paiement non fait ou un contrat non signé peut entraîner l'arrêt des services.</p>
          </div>
        </>
      )}

      {/* Payment options - facture only (contrat has its own) */}
      {type === "facture" && (
        <div className="mb-3 text-xs">
          <p className="font-bold uppercase text-gray-600 mb-1">Modalités de paiement</p>
          <div className="space-y-1">
            <label className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 border border-gray-400 rounded-sm flex-shrink-0" />
              Option 1 — Paiement intégral avant le début des services
            </label>
            <label className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 border border-gray-400 rounded-sm flex-shrink-0" />
              Option 2 — 2 versements égaux
            </label>
            <p className="text-[10px] text-gray-500 mt-1">
              Mode de paiement : Virement Interac au {companyInfo.phone} ou argent comptant.
            </p>
          </div>
        </div>
      )}

      {/* Payment info for contrat */}
      {type === "contrat" && (
        <div className="mb-3 text-xs">
          <p className="font-bold uppercase text-gray-600 mb-1">Modalités de paiement</p>
          <p>Mode de paiement : Virement Interac au {companyInfo.phone} ou argent comptant.</p>
          <p className="text-[10px] text-gray-500 mt-0.5 italic">Veuillez inscrire le numéro de contrat avec chaque paiement.</p>
        </div>
      )}

      {/* Notes */}
      <div className="mb-4 text-xs">
        <p className="font-bold uppercase text-gray-600 mb-1">Notes</p>
        <div className="border border-gray-200 rounded h-12 bg-gray-50" />
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-6">
        <div>
          <div className="border-t-2 border-black pt-1 text-xs text-center text-gray-600">
            Signature de l'entrepreneur
          </div>
          <p className="text-center text-[10px] text-gray-500 mt-0.5">{companyInfo.owner}</p>
        </div>
        <div>
          <div className="border-t-2 border-black pt-1 text-xs text-center text-gray-600">
            Signature du client
          </div>
          {type === "contrat" && (
            <p className="text-center text-[10px] text-gray-500 mt-0.5">Date: _______________</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 border-t border-gray-200 text-center text-[9px] text-gray-400">
        {companyInfo.name} — {companyInfo.phone} — {companyInfo.email} — NEQ: {companyInfo.neq}
      </div>
    </div>
  );
};

const DocumentsVierges = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<DocType>("soumission");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        {(["soumission", "facture", "contrat"] as DocType[]).map((type) => {
          const { label, icon: Icon } = docConfig[type];
          return (
            <Button
              key={type}
              size="sm"
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
              className="gap-1"
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </Button>
          );
        })}
        <Button size="sm" onClick={handlePrint} className="gap-1">
          <Printer className="h-4 w-4" /> Imprimer
        </Button>
      </div>

      <div className="p-4 sm:p-8">
        <BlankDocument type={selectedType} />
      </div>
    </div>
  );
};

export default DocumentsVierges;
