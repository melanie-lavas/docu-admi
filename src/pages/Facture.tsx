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
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ClientInfo, LineItem } from "@/lib/companyInfo";
import signatureImg from "@/assets/signature-max.png";

const FacturePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialClient: ClientInfo = {
    name: searchParams.get("name") || "",
    address: searchParams.get("address") || "",
    city: searchParams.get("city") || "",
    phone: searchParams.get("phone") || "",
    email: searchParams.get("email") || "",
  };
  const [client, setClient] = useState<ClientInfo>(initialClient.name ? initialClient : { ...emptyClient });
  const [items, setItems] = useState<LineItem[]>([createLineItem()]);
  const [docNumber, setDocNumber] = useState("");
  const [date, setDate] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <Button size="sm" onClick={() => window.print()} className="gap-1">
          <Printer className="h-4 w-4" /> Imprimer
        </Button>
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

        {/* Important Notice */}
        <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-destructive">⚠️ Important</p>
          <p className="text-xs text-foreground mt-1">
            Vous devez retourner le contrat signé avant le début des services. Un paiement non fait ou un contrat non signé peut entraîner l'arrêt des services.
          </p>
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
