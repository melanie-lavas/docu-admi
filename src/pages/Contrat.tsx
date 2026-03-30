import { useState } from "react";
import DocumentHeader from "@/components/DocumentHeader";
import ClientSection from "@/components/ClientSection";
import DocumentFooter from "@/components/DocumentFooter";
import SignatureCanvas from "@/components/SignatureCanvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { companyInfo, emptyClient } from "@/lib/companyInfo";
import { Printer, ArrowLeft, Save, Share2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ClientInfo } from "@/lib/companyInfo";
import signatureImg from "@/assets/signature-max.png";

const ContratPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId") || "";
  const initialClient: ClientInfo = {
    name: searchParams.get("name") || "",
    address: searchParams.get("address") || "",
    city: searchParams.get("city") || "",
    phone: searchParams.get("phone") || "",
    email: searchParams.get("email") || ""
  };
  const [client, setClient] = useState<ClientInfo>(initialClient.name ? initialClient : { ...emptyClient });
  const [docNumber, setDocNumber] = useState("");
  const [date, setDate] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState("");
  const [paymentOption, setPaymentOption] = useState<"" | "A" | "B">("");
  const [saving, setSaving] = useState(false);

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
    const { error } = await supabase.from("client_documents").insert({
      client_id: clientId,
      doc_type: "contrat",
      doc_number: docNumber,
      date: date || null,
      amount: parseFloat(totalPrice) || 0,
      notes: `Option: ${paymentOption || "N/A"} | Services: ${selectedServices.join(", ")}`,
      status: "actif"
    });
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Contrat enregistré!");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Contrat ${docNumber || ""} — E.M.J`, url });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(url);
    toast.success("Lien copié!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        {clientId &&
        <Button size="sm" variant="outline" onClick={handleSave} disabled={saving} className="gap-1">
            <Save className="h-4 w-4" /> {saving ? "..." : "Enregistrer"}
          </Button>
        }
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
          documentType="Contrat de Service"
          documentNumber={docNumber}
          date={date}
          onDocNumberChange={setDocNumber}
          onDateChange={setDate} />
        

        <ClientSection client={client} onChange={setClient} />

        {/* Contract Period */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Période du contrat
          </h3>
          <p className="text-sm font-semibold text-foreground">
            Valide du 1er mai 2026 au 15 octobre 2026 — 22 passages assurés.
          </p>
          <p className="text-sm text-foreground mt-2">
            Entretien hebdomadaire sauf en cas d'urgence météo.
          </p>
        </div>

        {/* Services */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Services inclus
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {companyInfo.services.map((service) =>
            <label key={service} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                checked={selectedServices.includes(service)}
                onCheckedChange={() => toggleService(service)} />
              
                {service}
              </label>
            )}
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
              type="number"
              step="0.01" />
            
            <span className="text-muted-foreground text-sm">$</span>
          </div>

          {/* Payment Options */}
          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            Options de paiement
          </h4>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:border-primary transition-colors">
              <Checkbox
                checked={paymentOption === "A"}
                onCheckedChange={() => setPaymentOption(paymentOption === "A" ? "" : "A")} />
              
              <div className="text-sm">
                <span className="font-semibold text-foreground">Option A — Paiement intégral</span>
                <p className="text-muted-foreground text-xs mt-0.5">Règlement unique avant le 1er mai 2026</p>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-border hover:border-primary transition-colors">
              <Checkbox
                checked={paymentOption === "B"}
                onCheckedChange={() => setPaymentOption(paymentOption === "B" ? "" : "B")} />
              
              <div className="text-sm">
                <span className="font-semibold text-foreground">Option B — 2 versements égaux</span>
                <p className="text-muted-foreground text-xs mt-0.5">1er versement le 15 avril 2026, 2e versement le 15 août 2026</p>
              </div>
            </label>
          </div>
        </div>

        {/* Payment info */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
            Modalités de paiement
          </h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Mode de paiement :</strong> Virement Interac au 819-293-7675 ou argent comptant</p>
            <p className="text-xs italic mt-2">Veuillez inscrire le numéro de contrat avec chaque paiement.</p>
          </div>
        </div>

        {/* Clauses */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Clauses du contrat
          </h3>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-foreground">
            <li>L'entrepreneur se réserve le droit de mettre fin au contrat sans préavis en cas de manque de respect ou de non-paiement.</li>
            <li>L'entrepreneur n'est pas responsable des conditions météorologiques. En cas de pluie pendant trois jours consécutifs ou plus, il fera de son mieux malgré le retard, mais ne pourra être tenu responsable.</li>
            <li>Le gazon sera coupé à une hauteur de 3,5 pouces (1 à 2 passages selon les besoins).</li>
            <li>Le client dispose de 24 heures après le service ou le passage pour signaler toute insatisfaction ou plainte. Passé ce délai, aucune plainte ne sera prise en considération.</li>
            <li>Tout travail additionnel non prévu au contrat fera l'objet d'une soumission séparée.</li>
          </ol>
        </div>

        {/* Important Notice */}
        <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-4 mb-6">
          
          <p className="text-xs text-foreground mt-1">
            Vous devez retourner le contrat signé avant le début des services. Un paiement non fait ou un contrat non signé peut entraîner l'arrêt des services.
          </p>
        </div>

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
            <p className="text-center text-xs text-muted-foreground mt-1">Date: _______________</p>
          </div>
        </div>

        <DocumentFooter />
      </div>
    </div>);

};

export default ContratPage;