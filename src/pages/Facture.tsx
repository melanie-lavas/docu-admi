import { useState } from "react";
import DocumentHeader from "@/components/DocumentHeader";
import ClientSection from "@/components/ClientSection";
import LineItemsTable from "@/components/LineItemsTable";
import DocumentFooter from "@/components/DocumentFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Checkbox } from "@/components/ui/checkbox";
import { emptyClient, createLineItem, companyInfo } from "@/lib/companyInfo";
import { Printer, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ClientInfo, LineItem } from "@/lib/companyInfo";
import signatureImg from "@/assets/signature-max.png";

const FacturePage = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientInfo>({ ...emptyClient });
  const [items, setItems] = useState<LineItem[]>([createLineItem()]);
  const [docNumber, setDocNumber] = useState("F-001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("Paiement dû dans les 30 jours suivant la réception de la facture.");

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground">N°</Label>
            <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="w-20 sm:w-28 h-8 text-sm" />
          </div>
          <div className="flex items-center gap-1">
            <Label className="text-xs text-muted-foreground hidden sm:inline">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-32 sm:w-36 h-8 text-sm" />
          </div>
          <Button size="sm" onClick={() => window.print()} className="gap-1">
            <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Imprimer</span>
          </Button>
        </div>
      </div>

      {/* Document */}
      <div className="max-w-4xl mx-auto p-4 sm:p-8 print-page">
        <DocumentHeader documentType="Facture" documentNumber={docNumber} date={date} />
        <ClientSection client={client} onChange={setClient} />

        {/* Services */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Services
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        <LineItemsTable items={items} onChange={setItems} showTaxes={true} />

        {/* Payment info */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Modalités de paiement
          </h3>
          <div className="space-y-2 text-sm mb-4">
            <p className="text-foreground">☐ <strong>Option 1</strong> — Paiement en totalité avant le 1er mai 2026</p>
            <p className="text-foreground">☐ <strong>Option 2</strong> — 2 versements égaux : 1er versement le 15 avril 2026, 2e versement le 15 août 2026</p>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Mode de paiement :</strong> Virement Interac au 819-293-7675 ou argent comptant</p>
            <p className="text-xs italic mt-2">Veuillez inscrire le numéro de facture avec chaque paiement.</p>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
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
          </div>
          <div>
            <div className="h-24 mb-1"></div>
            <div className="border-t-2 border-foreground pt-2 text-center text-sm text-muted-foreground">
              Signature du client
            </div>
          </div>
        </div>

        <DocumentFooter />
      </div>
    </div>
  );
};

export default FacturePage;
