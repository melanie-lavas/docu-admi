import { useState } from "react";
import DocumentHeader from "@/components/DocumentHeader";
import DocumentFooter from "@/components/DocumentFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { companyInfo } from "@/lib/companyInfo";
import { Printer, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import signatureImg from "@/assets/signature-max.png";

const ContratPage = () => {
  const navigate = useNavigate();
  const [docNumber, setDocNumber] = useState("C-001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [nbPassages, setNbPassages] = useState("22");
  const [totalPrice, setTotalPrice] = useState("");
  const [paymentOption, setPaymentOption] = useState<"" | "A" | "B">("");
  const [conditions, setConditions] = useState(
    `1. L'entrepreneur s'engage à fournir les services décrits ci-dessus selon les termes convenus.\n2. Le client s'engage à payer le montant total convenu selon les modalités établies.\n3. Tout travail additionnel non prévu au contrat fera l'objet d'une soumission séparée.\n4. Ce contrat peut être résilié par l'une ou l'autre des parties avec un préavis écrit de 30 jours.\n5. L'entrepreneur n'est pas responsable des dommages causés par des conditions météorologiques extrêmes.`
  );

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">N°</Label>
            <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="w-28 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-36 h-8 text-sm" />
          </div>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Imprimer
          </Button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-4xl mx-auto p-8 print-page">
        <DocumentHeader documentType="Contrat de Service" documentNumber={docNumber} date={date} />

        {/* Client Section - Blank lines for handwriting */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Informations du client
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-end gap-2">
              <span className="text-muted-foreground whitespace-nowrap min-w-[120px]">Nom / Entreprise :</span>
              <div className="flex-1 border-b border-foreground/40 min-h-[24px]"></div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-muted-foreground whitespace-nowrap min-w-[120px]">Adresse :</span>
              <div className="flex-1 border-b border-foreground/40 min-h-[24px]"></div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-muted-foreground whitespace-nowrap min-w-[120px]">Ville :</span>
              <div className="flex-1 border-b border-foreground/40 min-h-[24px]"></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-end gap-2">
                <span className="text-muted-foreground whitespace-nowrap min-w-[120px]">Téléphone :</span>
                <div className="flex-1 border-b border-foreground/40 min-h-[24px]"></div>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-muted-foreground whitespace-nowrap min-w-[80px]">Courriel :</span>
                <div className="flex-1 border-b border-foreground/40 min-h-[24px]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Period */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Période du contrat
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs">Date de début</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Date de fin</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Nombre de passages</Label>
              <Input value={nbPassages} onChange={(e) => setNbPassages(e.target.value)} className="mt-1" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Le Prestataire effectuera {nbPassages} passages pendant la période contractualisée, répartis régulièrement en fonction des besoins de la pelouse et des conditions climatiques. La fréquence peut être ajustée par le Prestataire selon les recommandations agronomiques.
          </p>
        </div>

        {/* Services */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Services inclus
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {companyInfo.services.map((service) => (
              <label key={service} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={selectedServices.includes(service)}
                  onCheckedChange={() => toggleService(service)}
                />
                {service}
              </label>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Montant convenu
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <Input
              value={totalPrice}
              onChange={(e) => setTotalPrice(e.target.value)}
              placeholder="0.00"
              className="w-40 text-right"
            />
            <span className="text-muted-foreground text-sm">$ (avant taxes)</span>
          </div>

          {/* Payment Options */}
          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Options de paiement
          </h4>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:border-primary transition-colors">
              <Checkbox
                checked={paymentOption === "A"}
                onCheckedChange={() => setPaymentOption(paymentOption === "A" ? "" : "A")}
              />
              <div className="text-sm">
                <span className="font-semibold text-foreground">Option A — Paiement intégral</span>
                <p className="text-muted-foreground text-xs mt-0.5">Règlement unique avant le 1er mai 2026</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:border-primary transition-colors">
              <Checkbox
                checked={paymentOption === "B"}
                onCheckedChange={() => setPaymentOption(paymentOption === "B" ? "" : "B")}
              />
              <div className="text-sm">
                <span className="font-semibold text-foreground">Option B — 2 versements égaux</span>
                <p className="text-muted-foreground text-xs mt-0.5">1er versement le 15 avril 2026, 2e versement le 15 août 2026</p>
              </div>
            </label>
          </div>
        </div>

        {/* Conditions */}
        <div className="mb-6">
          <Label className="text-xs text-muted-foreground">Termes et conditions</Label>
          <Textarea
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            rows={8}
            className="mt-1 text-sm"
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div>
            <img src={signatureImg} alt="Signature Maxime Jutras" className="h-24 mx-auto mb-1 object-contain" />
            <div className="border-t-2 border-foreground pt-2 text-center text-sm text-muted-foreground">
              Signature de l'entrepreneur
            </div>
            <p className="text-center text-xs text-muted-foreground mt-1">{companyInfo.owner}</p>
          </div>
          <div>
            <div className="h-24 mb-1"></div>
            <div className="border-t-2 border-foreground pt-2 text-center text-sm text-muted-foreground">
              Signature du client
            </div>
            <p className="text-center text-xs text-muted-foreground mt-1">Date: _______________</p>
          </div>
        </div>

        <DocumentFooter />
      </div>
    </div>
  );
};

export default ContratPage;
