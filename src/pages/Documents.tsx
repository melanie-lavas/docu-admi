import { useState, useEffect } from "react";
import DocumentHeader from "@/components/DocumentHeader";
import ClientSection from "@/components/ClientSection";
import LineItemsTable from "@/components/LineItemsTable";
import DocumentFooter from "@/components/DocumentFooter";
import SignatureCanvas from "@/components/SignatureCanvas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { emptyClient, createLineItem, companyInfo, calculateSubtotal, TPS_RATE, TVQ_RATE } from "@/lib/companyInfo";
import { Printer, ArrowLeft, Save, Share2, FileText, Receipt, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ClientInfo, LineItem } from "@/lib/companyInfo";
import type { Tables } from "@/integrations/supabase/types";
import signatureImg from "@/assets/signature-max.png";

type Client = Tables<"clients">;

interface SavedService {
  id: string;
  description: string;
  unit_price: number;
}

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [docType, setDocType] = useState<"soumission" | "facture" | "contrat">("soumission");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [client, setClient] = useState<ClientInfo>({ ...emptyClient });
  const [items, setItems] = useState<LineItem[]>([createLineItem()]);
  const [docNumber, setDocNumber] = useState("");
  const [date, setDate] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [paymentOption, setPaymentOption] = useState<"" | "1" | "2">("");
  const [totalPrice, setTotalPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedServices, setSavedServices] = useState<SavedService[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch clients
  useEffect(() => {
    supabase.from("clients").select("*").order("name").then(({ data }) => {
      if (data) setClients(data);
    });
  }, []);

  // Fetch saved services
  useEffect(() => {
    supabase.from("saved_services").select("*").order("description").then(({ data }) => {
      if (data) setSavedServices(data as SavedService[]);
    });
  }, []);

  // Auto-fill client info when selecting a client
  useEffect(() => {
    if (!selectedClientId) {
      setClient({ ...emptyClient });
      return;
    }
    const c = clients.find((cl) => cl.id === selectedClientId);
    if (c) {
      setClient({
        name: c.name,
        address: c.address || "",
        city: c.city || "",
        phone: c.phone || "",
        email: c.email || "",
      });
    }
  }, [selectedClientId, clients]);

  // Auto-save new service descriptions
  const handleItemsChange = async (newItems: LineItem[]) => {
    setItems(newItems);
    // Check for new descriptions to save
    for (const item of newItems) {
      if (
        item.description.trim() &&
        item.unitPrice > 0 &&
        !savedServices.some((s) => s.description.toLowerCase() === item.description.toLowerCase())
      ) {
        // Save after a brief moment (will be triggered on blur effectively)
      }
    }
  };

  const saveServiceIfNew = async (description: string, unitPrice: number) => {
    if (!description.trim() || unitPrice <= 0) return;
    const exists = savedServices.some(
      (s) => s.description.toLowerCase() === description.trim().toLowerCase()
    );
    if (exists) return;
    const { data, error } = await supabase
      .from("saved_services")
      .insert({ description: description.trim(), unit_price: unitPrice })
      .select()
      .single();
    if (data && !error) {
      setSavedServices((prev) => [...prev, data as SavedService]);
    }
  };

  const addSavedServiceToItems = (service: SavedService) => {
    const newItem: LineItem = {
      id: crypto.randomUUID(),
      description: service.description,
      quantity: 1,
      unitPrice: service.unit_price,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const deleteSavedService = async (id: string) => {
    await supabase.from("saved_services").delete().eq("id", id);
    setSavedServices((prev) => prev.filter((s) => s.id !== id));
    toast.success("Service supprimé");
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleSave = async () => {
    if (!selectedClientId) {
      toast.error("Veuillez sélectionner un client.");
      return;
    }
    setSaving(true);

    // Save any new services from items
    for (const item of items) {
      await saveServiceIfNew(item.description, item.unitPrice);
    }

    const subtotal = calculateSubtotal(items);
    const amount = docType === "facture"
      ? Math.round(subtotal * (1 + TPS_RATE + TVQ_RATE) * 100) / 100
      : docType === "contrat"
      ? parseFloat(totalPrice) || subtotal
      : subtotal;

    const { error } = await supabase.from("client_documents").insert({
      client_id: selectedClientId,
      doc_type: docType,
      doc_number: docNumber,
      date: date || null,
      amount,
      notes: docType === "contrat"
        ? `Option: ${paymentOption || "N/A"} | Services: ${selectedServices.join(", ")}`
        : notes,
      status: "actif",
    });
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      const labels = { soumission: "Soumission", facture: "Facture", contrat: "Contrat" };
      toast.success(`${labels[docType]} enregistrée!`);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `Document — E.M.J`, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    toast.success("Lien copié!");
  };

  const docLabels = {
    soumission: "Soumission",
    facture: "Facture",
    contrat: "Contrat de Service",
  };

  const showTaxes = docType === "facture";

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => showPreview ? setShowPreview(false) : navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> {showPreview ? "Éditer" : "Menu"}
        </Button>
        {!showPreview && (
          <>
            <Button size="sm" variant="outline" onClick={handleSave} disabled={saving || !selectedClientId} className="gap-1">
              <Save className="h-4 w-4" /> {saving ? "..." : "Enregistrer"}
            </Button>
            <Button size="sm" onClick={() => setShowPreview(true)} className="gap-1">
              <FileText className="h-4 w-4" /> Aperçu
            </Button>
          </>
        )}
        {showPreview && (
          <>
            <Button size="sm" variant="outline" onClick={handleShare} className="gap-1">
              <Share2 className="h-4 w-4" /> Partager
            </Button>
            <Button size="sm" onClick={() => window.print()} className="gap-1">
              <Printer className="h-4 w-4" /> Imprimer
            </Button>
          </>
        )}
      </div>

      {!showPreview ? (
        /* ===== EDIT MODE ===== */
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
          {/* Doc Type Selector */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Type de document</Label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { key: "soumission" as const, label: "Soumission", icon: FileText },
                { key: "facture" as const, label: "Facture", icon: Receipt },
                { key: "contrat" as const, label: "Contrat", icon: ScrollText },
              ]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setDocType(key)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${
                    docType === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Client Selector */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Client</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.city ? `— ${c.city}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doc Number & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Numéro</Label>
              <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="001" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>
          </div>

          {/* Client Info (read-only summary) */}
          {selectedClientId && (
            <div className="border border-border rounded-lg p-4 bg-secondary/30">
              <p className="text-sm font-semibold text-foreground">{client.name}</p>
              <p className="text-xs text-muted-foreground">{client.address} {client.city && `— ${client.city}`}</p>
              <p className="text-xs text-muted-foreground">{client.phone} {client.email && `— ${client.email}`}</p>
            </div>
          )}

          {/* Services checklist */}
          <div className="border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {companyInfo.services.map((service) => (
                <label key={service} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={selectedServices.includes(service)} onCheckedChange={() => toggleService(service)} />
                  {service}
                </label>
              ))}
            </div>
          </div>

          {/* Saved Services Bank */}
          {savedServices.length > 0 && (
            <div className="border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
                Services enregistrés — cliquez pour ajouter
              </h3>
              <div className="flex flex-wrap gap-2">
                {savedServices.map((s) => (
                  <div key={s.id} className="group relative">
                    <button
                      onClick={() => addSavedServiceToItems(s)}
                      className="text-xs bg-secondary hover:bg-primary/10 border border-border hover:border-primary rounded-lg px-3 py-2 transition-colors text-left"
                    >
                      <span className="font-medium text-foreground">{s.description}</span>
                      <span className="text-muted-foreground ml-2">{s.unit_price.toFixed(2)} $</span>
                    </button>
                    <button
                      onClick={() => deleteSavedService(s.id)}
                      className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 bg-destructive text-destructive-foreground rounded-full items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line Items */}
          <LineItemsTable items={items} onChange={handleItemsChange} showTaxes={showTaxes} />

          {/* Save services hint */}
          <p className="text-xs text-muted-foreground italic">
            💡 Les services avec un prix seront automatiquement sauvegardés lors de l'enregistrement.
          </p>

          {/* Contrat-specific: total price */}
          {docType === "contrat" && (
            <div className="border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Montant convenu</h3>
              <div className="flex items-center gap-2">
                <Input value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)} placeholder="0.00" className="w-40 text-right" type="number" step="0.01" />
                <span className="text-muted-foreground text-sm">$</span>
              </div>
            </div>
          )}

          {/* Payment options (facture & contrat) */}
          {(docType === "facture" || docType === "contrat") && (
            <div className="border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Options de paiement</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:border-primary transition-colors">
                  <Checkbox checked={paymentOption === "1"} onCheckedChange={() => setPaymentOption(paymentOption === "1" ? "" : "1")} />
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">Option 1 — Paiement intégral</span>
                    <p className="text-muted-foreground text-xs mt-0.5">Paiement en totalité avant le 1er mai 2026</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:border-primary transition-colors">
                  <Checkbox checked={paymentOption === "2"} onCheckedChange={() => setPaymentOption(paymentOption === "2" ? "" : "2")} />
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">Option 2 — 2 versements égaux</span>
                    <p className="text-muted-foreground text-xs mt-0.5">1er versement le 15 avril 2026, 2e versement le 15 août 2026</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label className="text-xs text-muted-foreground">Notes / Conditions</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 text-sm" />
          </div>
        </div>
      ) : (
        /* ===== PRINT PREVIEW ===== */
        <div className="max-w-4xl mx-auto p-4 sm:p-8 print-page">
          <DocumentHeader documentType={docLabels[docType]} documentNumber={docNumber} date={date} />
          <ClientSection client={client} onChange={() => {}} readOnly />

          {/* Services */}
          {selectedServices.length > 0 && (
            <div className="border border-border rounded-lg p-5 mb-6">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedServices.map((s) => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <span className="text-primary">✓</span> {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line items */}
          <LineItemsTable items={items} onChange={() => {}} showTaxes={showTaxes} />

          {/* Contrat-specific sections */}
          {docType === "contrat" && (
            <>
              {/* Period */}
              <div className="border border-border rounded-lg p-5 mb-6">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Période du contrat</h3>
                <p className="text-sm font-semibold text-foreground">Valide du 1er mai 2026 au 15 octobre 2026 — 22 passages assurés.</p>
                <p className="text-sm text-foreground mt-2">Entretien hebdomadaire sauf en cas d'urgence météo.</p>
              </div>

              {/* Clauses */}
              <div className="border border-border rounded-lg p-5 mb-6">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Clauses du contrat</h3>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-foreground">
                  <li>L'entrepreneur se réserve le droit de mettre fin au contrat sans préavis en cas de manque de respect ou de non-paiement.</li>
                  <li>L'entrepreneur n'est pas responsable des conditions météorologiques. En cas de pluie pendant trois jours consécutifs ou plus, il fera de son mieux malgré le retard, mais ne pourra être tenu responsable.</li>
                  <li>Le gazon sera coupé à une hauteur de 3 pouces (1 à 2 passages selon les besoins).</li>
                  <li>Le client dispose de 24 heures après le service ou le passage pour signaler toute insatisfaction ou plainte. Passé ce délai, aucune plainte ne sera prise en considération.</li>
                  <li>Tout travail additionnel non prévu au contrat fera l'objet d'une soumission séparée.</li>
                </ol>
              </div>
            </>
          )}

          {/* Payment info (facture & contrat) */}
          {(docType === "facture" || docType === "contrat") && (
            <>
              {paymentOption && (
                <div className="border border-border rounded-lg p-5 mb-6">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Modalités de paiement</h3>
                  {paymentOption === "1" && (
                    <p className="text-sm text-foreground"><strong>Option 1 — Paiement intégral</strong> avant le 1er mai 2026</p>
                  )}
                  {paymentOption === "2" && (
                    <p className="text-sm text-foreground"><strong>Option 2 — 2 versements égaux</strong> (15 avril et 15 août 2026)</p>
                  )}
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p><strong className="text-foreground">Mode de paiement :</strong> Virement Interac au 819-293-7675 ou argent comptant</p>
                    <p className="text-xs italic mt-2">Veuillez inscrire le numéro de document avec chaque paiement.</p>
                  </div>
                </div>
              )}

              {/* Important Notice */}
              <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-destructive">⚠️ Important</p>
                <p className="text-xs text-foreground mt-1">
                  Vous devez retourner le contrat signé avant le début des services. Un paiement non fait ou un contrat non signé peut entraîner l'arrêt des services.
                </p>
              </div>
            </>
          )}

          {/* Notes */}
          {notes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-foreground whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div>
              <img src={signatureImg} alt="Signature Maxime Jutras" className="w-full h-auto max-h-32 mb-1 object-contain" />
              <div className="border-t-2 border-foreground pt-2 text-center text-sm text-muted-foreground">
                Signature de l'entrepreneur
              </div>
              <p className="text-center text-xs text-muted-foreground mt-1">{companyInfo.owner}</p>
            </div>
            <div>
              <SignatureCanvas label="Signature du client" />
              {docType === "contrat" && <p className="text-center text-xs text-muted-foreground mt-1">Date: _______________</p>}
            </div>
          </div>

          <DocumentFooter />
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
