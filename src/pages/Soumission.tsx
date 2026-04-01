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
import { emptyClient, createLineItem, companyInfo, calculateSubtotal } from "@/lib/companyInfo";
import { Printer, ArrowLeft, Save, Share2, ArrowRightLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ClientInfo, LineItem } from "@/lib/companyInfo";
import signatureImg from "@/assets/signature-max.png";

const SoumissionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId") || "";
  const docId = searchParams.get("docId") || "";
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
  const [saving, setSaving] = useState(false);
  const [existingDocId, setExistingDocId] = useState(docId);

  // Load existing document data
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
      if (data.line_items && Array.isArray(data.line_items) && (data.line_items as any[]).length > 0) {
        setItems(data.line_items as unknown as LineItem[]);
      }
    };
    load();
  }, [docId]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `Soumission ${docNumber || ""} — E.M.J`, url }); return; } catch {}
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
    const amount = calculateSubtotal(items);
    const docData = {
      client_id: clientId,
      doc_type: "soumission" as const,
      doc_number: docNumber,
      date: date || null,
      amount,
      notes,
      selected_services: selectedServices,
      line_items: JSON.parse(JSON.stringify(items)),
      status: "actif",
    };

    let error;
    if (existingDocId) {
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
      toast.success("Soumission enregistrée!");
    }
  };

  const convertToContrat = () => {
    const params = new URLSearchParams({
      clientId,
      convertFrom: "soumission",
      name: client.name,
      address: client.address || "",
      city: client.city || "",
      phone: client.phone || "",
      email: client.email || "",
      baseNumber: docNumber.replace(/^S-?/i, ""),
      amount: String(calculateSubtotal(items)),
      services: JSON.stringify(selectedServices),
      lineItems: JSON.stringify(items),
    });
    if (existingDocId) params.set("sourceDocId", existingDocId);
    navigate(`/contrat?${params.toString()}`);
  };

  const convertToFacture = () => {
    const params = new URLSearchParams({
      clientId,
      convertFrom: "soumission",
      name: client.name,
      address: client.address || "",
      city: client.city || "",
      phone: client.phone || "",
      email: client.email || "",
      baseNumber: docNumber.replace(/^S-?/i, ""),
      amount: String(calculateSubtotal(items)),
      services: JSON.stringify(selectedServices),
      lineItems: JSON.stringify(items),
    });
    if (existingDocId) params.set("sourceDocId", existingDocId);
    navigate(`/facture?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        {clientId && (
          <Button size="sm" variant="outline" onClick={handleSave} disabled={saving} className="gap-1">
            <Save className="h-4 w-4" /> {saving ? "..." : "Enregistrer"}
          </Button>
        )}
        {clientId && (
          <>
            <Button size="sm" variant="outline" onClick={convertToContrat} className="gap-1">
              <ArrowRightLeft className="h-3 w-3" /> → Contrat
            </Button>
            <Button size="sm" variant="outline" onClick={convertToFacture} className="gap-1">
              <ArrowRightLeft className="h-3 w-3" /> → Facture
            </Button>
          </>
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
          documentType="Soumission"
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

        <LineItemsTable items={items} onChange={setItems} />

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

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-12">
          <div>
            <img src={signatureImg} alt="Signature Maxime Jutras" className="w-full h-auto max-h-32 mb-1 object-contain" />
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

export default SoumissionPage;
