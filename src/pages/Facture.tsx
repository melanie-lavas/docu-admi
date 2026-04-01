import { useState, useEffect } from "react";
import DocumentHeader from "@/components/DocumentHeader";
import ClientSection from "@/components/ClientSection";
import LineItemsTable from "@/components/LineItemsTable";
import DocumentFooter from "@/components/DocumentFooter";
import SignatureCanvas from "@/components/SignatureCanvas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { emptyClient, createLineItem, companyInfo, calculateSubtotal, TPS_RATE, TVQ_RATE } from "@/lib/companyInfo";
import { Printer, ArrowLeft, Save, Share2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ClientInfo, LineItem } from "@/lib/companyInfo";
import signatureImg from "@/assets/signature-max.png";

const FacturePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId") || "";
  const docId = searchParams.get("docId") || "";
  const convertFrom = searchParams.get("convertFrom") || "";
  const baseNumber = searchParams.get("baseNumber") || "";
  const initialClient: ClientInfo = {
    name: searchParams.get("name") || "",
    address: searchParams.get("address") || "",
    city: searchParams.get("city") || "",
    phone: searchParams.get("phone") || "",
    email: searchParams.get("email") || "",
  };
  const [client, setClient] = useState<ClientInfo>(initialClient.name ? initialClient : { ...emptyClient });
  const [items, setItems] = useState<LineItem[]>([createLineItem()]);
  const [docNumber, setDocNumber] = useState(baseNumber ? `F-${baseNumber}` : "");
  const [date, setDate] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [paymentOption, setPaymentOption] = useState<"" | "1" | "2">("");
  const [saving, setSaving] = useState(false);
  const [existingDocId, setExistingDocId] = useState(docId);

  // Load from conversion params
  useEffect(() => {
    if (convertFrom === "soumission") {
      const servicesParam = searchParams.get("services");
      const lineItemsParam = searchParams.get("lineItems");
      if (servicesParam) {
        try { setSelectedServices(JSON.parse(servicesParam)); } catch {}
      }
      if (lineItemsParam) {
        try {
          const parsed = JSON.parse(lineItemsParam);
          if (Array.isArray(parsed) && parsed.length > 0) setItems(parsed);
        } catch {}
      }
    }
  }, [convertFrom, searchParams]);

  // Load existing document
  useEffect(() => {
    if (!docId) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("client_documents")
        .select("*")
        .eq("id", docId)
        .single();
      if (error || !data) return;
      setDocNumber(data.doc_number || "");
      setDate(data.date || "");
      setNotes(data.notes || "");
      setSelectedServices(data.selected_services || []);
      if (data.payment_option) setPaymentOption(data.payment_option as "" | "1" | "2");
      if (data.line_items && Array.isArray(data.line_items) && (data.line_items as any[]).length > 0) {
        setItems(data.line_items as unknown as LineItem[]);
      }
    };
    load();
  }, [docId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `Facture ${docNumber || ""} — E.M.J`, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    toast.success("Lien copié!");
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleSave = async () => {
    if (!clientId) {
      toast.error("Ce document n'est pas lié à un client enregistré.");
      return;
    }
    setSaving(true);
    const subtotal = calculateSubtotal(items);
    const amount = subtotal * (1 + TPS_RATE + TVQ_RATE);
    const docData = {
      client_id: clientId,
      doc_type: "facture" as const,
      doc_number: docNumber,
      date: date || null,
      amount: Math.round(amount * 100) / 100,
      notes,
      selected_services: selectedServices,
      payment_option: paymentOption,
      line_items: items as unknown as Record<string, unknown>[],
      status: "actif",
    };

    let error;
    if (existingDocId && !convertFrom) {
      ({ error } = await supabase.from("client_documents").update(docData).eq("id", existingDocId));
    } else {
      const result = await supabase.from("client_documents").insert(docData).select("id").single();
      error = result.error;
      if (result.data) setExistingDocId(result.data.id);
    }
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Facture enregistrée!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        {clientId && (
          <Button size="sm" variant="outline" onClick={handleSave} disabled={saving} className="gap-1">
            <Save className="h-4 w-4" /> {saving ? "..." : "Enregistrer"}
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleShare} className="gap-1">
          <Share2 className="h-4 w-4" /> Partager
        </Button>
        <Button size="sm" onClick={() => window.print()} className="gap-1">
          <Printer className="h-4 w-4" /> Imprimer
        </Button>
      </div>

      {/* Document */}
      <div className="max-w-4xl mx-auto p-4 sm:p-8 print-page">
        <DocumentHeader
          documentType="Facture"
          documentNumber={docNumber}
          date={date}
          onDocNumberChange={setDocNumber}
          onDateChange={setDate}
        />
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
        {(() => {
          const subtotal = calculateSubtotal(items);
          const totalWithTax = subtotal * (1 + TPS_RATE + TVQ_RATE);
          const halfPayment = totalWithTax / 2;
          return (
            <div className="border border-border rounded-lg p-5 mb-6">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                Modalités de paiement
              </h3>
              <div className="space-y-3 mb-4">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:border-primary transition-colors">
                  <Checkbox
                    checked={paymentOption === "1"}
                    onCheckedChange={() => setPaymentOption(paymentOption === "1" ? "" : "1")}
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">Option 1 — Paiement intégral</span>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {totalWithTax > 0 ? `${totalWithTax.toFixed(2)} $` : "Montant total"} avant le 1er mai 2026
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:border-primary transition-colors">
                  <Checkbox
                    checked={paymentOption === "2"}
                    onCheckedChange={() => setPaymentOption(paymentOption === "2" ? "" : "2")}
                  />
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">Option 2 — 2 versements égaux</span>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {totalWithTax > 0 ? (
                        <>1er versement de <strong>{halfPayment.toFixed(2)} $</strong> le 15 avril 2026 — 2e versement de <strong>{halfPayment.toFixed(2)} $</strong> le 15 août 2026</>
                      ) : (
                        "1er versement le 15 avril 2026, 2e versement le 15 août 2026"
                      )}
                    </p>
                  </div>
                </label>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Mode de paiement :</strong> Virement Interac au 819-293-7675 ou argent comptant</p>
                <p className="text-xs italic mt-2">Veuillez inscrire le numéro de facture avec chaque paiement.</p>
              </div>
            </div>
          );
        })()}

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
          <SignatureCanvas label="Signature du client" />
        </div>

        <DocumentFooter />
      </div>
    </div>
  );
};

export default FacturePage;
