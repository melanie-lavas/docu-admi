import { useState } from "react";
import DocumentHeader from "@/components/DocumentHeader";
import ClientSection from "@/components/ClientSection";
import LineItemsTable from "@/components/LineItemsTable";
import DocumentFooter from "@/components/DocumentFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { emptyClient, createLineItem } from "@/lib/companyInfo";
import { Printer, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ClientInfo, LineItem } from "@/lib/companyInfo";

const SoumissionPage = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState<ClientInfo>({ ...emptyClient });
  const [items, setItems] = useState<LineItem[]>([createLineItem()]);
  const [docNumber, setDocNumber] = useState("S-001");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("Cette soumission est valide pour 30 jours à compter de la date d'émission.");

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
        <DocumentHeader documentType="Soumission" documentNumber={docNumber} date={date} />
        <ClientSection client={client} onChange={setClient} />
        <LineItemsTable items={items} onChange={setItems} />

        {/* Validity */}
        <div className="no-print flex items-center gap-4 mb-4">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Valide jusqu'au</Label>
          <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-44 h-8 text-sm" />
        </div>
        {validUntil && (
          <p className="text-sm text-muted-foreground mb-4 print-only hidden">
            Soumission valide jusqu'au {new Date(validUntil).toLocaleDateString("fr-CA")}
          </p>
        )}

        {/* Notes */}
        <div className="mb-6">
          <Label className="text-xs text-muted-foreground">Notes / Conditions</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 text-sm"
          />
        </div>

        {/* Signature */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div className="border-t-2 border-foreground pt-2 text-center text-sm text-muted-foreground">
            Signature de l'entrepreneur
          </div>
          <div className="border-t-2 border-foreground pt-2 text-center text-sm text-muted-foreground">
            Signature du client
          </div>
        </div>

        <DocumentFooter />
      </div>
    </div>
  );
};

export default SoumissionPage;
