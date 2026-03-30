import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, DollarSign, CalendarCheck, Trash2, Plus, Send, Save, Download, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Client = Tables<"clients">;
type ClientDocument = Tables<"client_documents">;
type ClientPayment = Tables<"client_payments">;
type ClientRun = Tables<"client_runs">;

const statusLabels: Record<string, string> = {
  non_signe: "Non signé",
  signe: "Signé",
  expire: "Expiré",
  en_attente: "En attente",
  partiel: "Partiel",
  paye: "Payé",
};

interface ClientDetailViewProps {
  client: Client;
  documents: ClientDocument[];
  payments: ClientPayment[];
  runs: ClientRun[];
  onBack: () => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const ClientDetailView = ({
  client,
  documents,
  payments,
  runs,
  onBack,
  onEdit,
  onDelete,
  onRefresh,
}: ClientDetailViewProps) => {
  const navigate = useNavigate();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(client.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  // Payment form state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payMethod, setPayMethod] = useState("interac");
  const [payNotes, setPayNotes] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  // Status updates
  const [updatingContract, setUpdatingContract] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalDocAmount = documents.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const saveNotes = async () => {
    setSavingNotes(true);
    const { error } = await supabase.from("clients").update({ notes: notesValue }).eq("id", client.id);
    setSavingNotes(false);
    if (error) toast.error("Erreur lors de la sauvegarde");
    else { toast.success("Notes sauvegardées"); setEditingNotes(false); onRefresh(); }
  };

  const updateContractStatus = async (status: string) => {
    setUpdatingContract(true);
    const updates: any = { contract_status: status };
    if (status === "signe") updates.contract_signed_date = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("clients").update(updates).eq("id", client.id);
    setUpdatingContract(false);
    if (error) toast.error("Erreur");
    else { toast.success("Statut du contrat mis à jour"); onRefresh(); }
  };

  const updatePaymentStatus = async (status: string) => {
    setUpdatingPayment(true);
    const { error } = await supabase.from("clients").update({ payment_status: status }).eq("id", client.id);
    setUpdatingPayment(false);
    if (error) toast.error("Erreur");
    else { toast.success("Statut de paiement mis à jour"); onRefresh(); }
  };

  const savePayment = async () => {
    const amount = parseFloat(payAmount.replace(",", "."));
    if (!amount || amount <= 0) { toast.error("Entrez un montant valide"); return; }
    setSavingPayment(true);
    const { error } = await supabase.from("client_payments").insert({
      client_id: client.id,
      amount,
      payment_date: payDate,
      method: payMethod,
      notes: payNotes,
    });
    setSavingPayment(false);
    if (error) toast.error("Erreur lors de la sauvegarde du paiement");
    else {
      toast.success("Paiement enregistré!");
      setShowPaymentForm(false);
      setPayAmount(""); setPayNotes("");

      const newTotal = totalPaid + amount;
      if (totalDocAmount > 0) {
        if (newTotal >= totalDocAmount) await supabase.from("clients").update({ payment_status: "paye" }).eq("id", client.id);
        else if (newTotal > 0) await supabase.from("clients").update({ payment_status: "partiel" }).eq("id", client.id);
      }
      onRefresh();
    }
  };

  const deletePayment = async (id: string) => {
    const { error } = await supabase.from("client_payments").delete().eq("id", id);
    if (error) toast.error("Erreur");
    else { toast.success("Paiement supprimé"); onRefresh(); }
  };

  const deleteDocument = async (id: string) => {
    const { error } = await supabase.from("client_documents").delete().eq("id", id);
    if (error) toast.error("Erreur lors de la suppression");
    else { toast.success("Document supprimé"); onRefresh(); }
  };

  const deleteRun = async (id: string) => {
    const { error } = await supabase.from("client_runs").delete().eq("id", id);
    if (error) toast.error("Erreur lors de la suppression");
    else { toast.success("Passage supprimé"); onRefresh(); }
  };

  const buildDocParams = () => {
    return new URLSearchParams({
      clientId: client.id,
      name: client.name,
      address: client.address || "",
      city: client.city || "",
      phone: client.phone || "",
      email: client.email || "",
    }).toString();
  };

  // Open an existing document in DocumentsVierges with its data
  const openDocument = (doc: ClientDocument) => {
    const params = new URLSearchParams({
      clientId: client.id,
      docId: doc.id,
      name: client.name,
      address: client.address || "",
      city: client.city || "",
      phone: client.phone || "",
      email: client.email || "",
    });
    navigate(`/documents-vierges?${params.toString()}`);
  };

  // Convert soumission to contrat-facture
  const convertToContratFacture = (doc: ClientDocument) => {
    const params = new URLSearchParams({
      clientId: client.id,
      docId: doc.id,
      convertFrom: "soumission",
      name: client.name,
      address: client.address || "",
      city: client.city || "",
      phone: client.phone || "",
      email: client.email || "",
    });
    navigate(`/documents-vierges?${params.toString()}`);
  };

  const sendDocumentByEmail = (doc: ClientDocument) => {
    if (!client.email) { toast.error("Ce client n'a pas d'adresse courriel"); return; }
    const docTypeLabel = doc.doc_type === "contrat-facture" ? "Contrat & Facture" : doc.doc_type === "facture" ? "Facture" : doc.doc_type === "contrat" ? "Contrat" : "Soumission";
    const subject = encodeURIComponent(`${docTypeLabel} ${doc.doc_number ? `#${doc.doc_number}` : ""} — Entretien Maxime Jutras`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-joint votre ${docTypeLabel.toLowerCase()}${doc.doc_number ? ` #${doc.doc_number}` : ""}.\n\nMontant: ${Number(doc.amount).toFixed(2)}$\n\nCordialement,\nMaxime Jutras\nEntretien Maxime Jutras\n819-293-7675`
    );
    window.open(`mailto:${client.email}?subject=${subject}&body=${body}`, "_blank");
    toast.success("Ouverture du client courriel...");
  };

  const docTypeLabel = (dt: string) => {
    if (dt === "contrat-facture") return "Contrat & Facture";
    if (dt === "facture") return "Facture";
    if (dt === "contrat") return "Contrat";
    return "Soumission";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <h1 className="text-sm font-semibold text-foreground truncate">{client.name}</h1>
        <div className="ml-auto flex gap-1">
          <Button size="sm" variant="outline" onClick={() => onEdit(client)}>Modifier</Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(client.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        {/* Client Info Card */}
        <div className="border border-border rounded-lg p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Adresse:</span> {client.address}</div>
            <div><span className="text-muted-foreground">Ville:</span> {client.city}</div>
            <div><span className="text-muted-foreground">Tél:</span> {client.phone}</div>
            <div><span className="text-muted-foreground">Courriel:</span> {client.email}</div>
          </div>

          {/* Status management */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase">Statut du contrat</Label>
                <Select value={client.contract_status || "non_signe"} onValueChange={updateContractStatus} disabled={updatingContract}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non_signe">❌ Non signé</SelectItem>
                    <SelectItem value="signe">✅ Signé</SelectItem>
                    <SelectItem value="expire">⏰ Expiré</SelectItem>
                  </SelectContent>
                </Select>
                {client.contract_signed_date && (
                  <p className="text-xs text-muted-foreground mt-1">Signé le {client.contract_signed_date}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-semibold uppercase">Statut du paiement</Label>
                <Select value={client.payment_status || "en_attente"} onValueChange={updatePaymentStatus} disabled={updatingPayment}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_attente">⏳ En attente</SelectItem>
                    <SelectItem value="partiel">🔶 Partiel</SelectItem>
                    <SelectItem value="paye">✅ Payé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payment summary */}
            {totalDocAmount > 0 && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total facturé:</span>
                  <span className="font-semibold">{totalDocAmount.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total payé:</span>
                  <span className="font-semibold text-primary">{totalPaid.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border mt-1 pt-1">
                  <span className="text-muted-foreground">Solde restant:</span>
                  <span className={`font-bold ${totalDocAmount - totalPaid > 0 ? "text-destructive" : "text-primary"}`}>
                    {(totalDocAmount - totalPaid).toFixed(2)} $
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Options de versement:</p>
                  <p>• <strong>Option A:</strong> {totalDocAmount.toFixed(2)} $ avant le 1er mai 2026</p>
                  <p>• <strong>Option B:</strong> 2 × {(totalDocAmount / 2).toFixed(2)} $ (15 avril et 15 août 2026)</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editable Notes */}
        <div className="border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs text-muted-foreground font-semibold uppercase">Notes / Rendez-vous</Label>
            {!editingNotes ? (
              <Button size="sm" variant="ghost" onClick={() => { setNotesValue(client.notes || ""); setEditingNotes(true); }}>
                Modifier
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>Annuler</Button>
                <Button size="sm" onClick={saveNotes} disabled={savingNotes} className="gap-1">
                  <Save className="h-3 w-3" /> {savingNotes ? "..." : "Sauvegarder"}
                </Button>
              </div>
            )}
          </div>
          {editingNotes ? (
            <Textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              rows={4}
              placeholder="Ex: Paiement reçu le 15 mars 2026 - 500$ interac. RDV confirmé le 1er mai..."
              className="text-sm"
            />
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {client.notes || <span className="text-muted-foreground italic">Aucune note.</span>}
            </p>
          )}
        </div>

        {/* Quick document creation — all go to DocumentsVierges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(`/documents-vierges?${buildDocParams()}&type=soumission`)}>
            <FileText className="h-3 w-3" /> Créer Soumission
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(`/documents-vierges?${buildDocParams()}&type=contrat-facture`)}>
            <DollarSign className="h-3 w-3" /> Créer Contrat & Facture
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="documents">
          <TabsList className="mb-4">
            <TabsTrigger value="documents" className="gap-1 text-xs"><FileText className="h-3 w-3" /> Documents ({documents.length})</TabsTrigger>
            <TabsTrigger value="payments" className="gap-1 text-xs"><DollarSign className="h-3 w-3" /> Paiements ({payments.length})</TabsTrigger>
            <TabsTrigger value="runs" className="gap-1 text-xs"><CalendarCheck className="h-3 w-3" /> Passages ({runs.length})</TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun document</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-border rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold">{docTypeLabel(doc.doc_type)}</span>
                        {doc.doc_number && <span className="text-muted-foreground ml-2">#{doc.doc_number}</span>}
                        <span className="text-muted-foreground ml-2">{doc.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{Number(doc.amount).toFixed(2)}$</span>
                        <Badge variant="outline" className="text-xs">{doc.status}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => openDocument(doc)}>
                        <FileText className="h-3 w-3" /> Ouvrir
                      </Button>
                      {doc.doc_type === "soumission" && (
                        <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => convertToContratFacture(doc)}>
                          <ArrowRightLeft className="h-3 w-3" /> Convertir en Contrat & Facture
                        </Button>
                      )}
                      {client.email && (
                        <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => sendDocumentByEmail(doc)}>
                          <Send className="h-3 w-3" /> Envoyer
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="gap-1 h-7 text-xs text-destructive hover:text-destructive" onClick={() => deleteDocument(doc.id)}>
                        <Trash2 className="h-3 w-3" /> Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <div className="mb-4">
              {!showPaymentForm ? (
                <Button size="sm" onClick={() => setShowPaymentForm(true)} className="gap-1">
                  <Plus className="h-4 w-4" /> Ajouter un paiement
                </Button>
              ) : (
                <div className="border border-border rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold">Nouveau paiement</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Montant ($) *</Label>
                      <Input value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date *</Label>
                      <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Méthode</Label>
                      <Select value={payMethod} onValueChange={setPayMethod}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interac">Interac</SelectItem>
                          <SelectItem value="comptant">Comptant</SelectItem>
                          <SelectItem value="cheque">Chèque</SelectItem>
                          <SelectItem value="virement">Virement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Notes</Label>
                      <Input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} placeholder="Ex: 1er versement..." className="mt-1" />
                    </div>
                  </div>

                  {/* Quick fill buttons */}
                  {totalDocAmount > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground w-full">Remplir rapidement:</p>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setPayAmount(totalDocAmount.toFixed(2)); setPayNotes("Paiement intégral"); }}>
                        Total: {totalDocAmount.toFixed(2)} $
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setPayAmount((totalDocAmount / 2).toFixed(2)); setPayNotes("1er versement (1/2)"); setPayDate("2026-04-15"); }}>
                        1er versement: {(totalDocAmount / 2).toFixed(2)} $
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { setPayAmount((totalDocAmount / 2).toFixed(2)); setPayNotes("2e versement (2/2)"); setPayDate("2026-08-15"); }}>
                        2e versement: {(totalDocAmount / 2).toFixed(2)} $
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" onClick={savePayment} disabled={savingPayment}>
                      {savingPayment ? "..." : "Enregistrer"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowPaymentForm(false)}>Annuler</Button>
                  </div>
                </div>
              )}
            </div>

            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun paiement enregistré</p>
            ) : (
              <div className="space-y-2">
                {payments.map((pay) => (
                  <div key={pay.id} className="border border-border rounded-lg p-3 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold">{Number(pay.amount).toFixed(2)}$</span>
                      <span className="text-muted-foreground ml-2">{pay.payment_date}</span>
                      {pay.notes && <span className="text-muted-foreground ml-2">— {pay.notes}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">{pay.method}</Badge>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deletePayment(pay.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Runs Tab */}
          <TabsContent value="runs">
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun passage</p>
            ) : (
              <div className="space-y-2">
                {runs.map((run) => (
                  <div key={run.id} className="border border-border rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{run.run_date}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={run.completed ? "default" : "secondary"}>
                          {run.completed ? "Complété" : "Planifié"}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteRun(run.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    {run.services_done && run.services_done.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{run.services_done.join(", ")}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDetailView;
