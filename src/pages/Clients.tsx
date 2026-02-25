import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Search, User, FileText, DollarSign, CalendarCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

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

const statusColors: Record<string, string> = {
  non_signe: "destructive",
  signe: "default",
  expire: "secondary",
  en_attente: "secondary",
  partiel: "outline",
  paye: "default",
};

const ClientsPage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [runs, setRuns] = useState<ClientRun[]>([]);

  // Form state for new/edit client
  const [form, setForm] = useState<TablesInsert<"clients">>({ name: "" });

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("name");
    if (data) setClients(data);
  };

  const fetchClientDetails = async (clientId: string) => {
    const [docs, pays, rns] = await Promise.all([
      supabase.from("client_documents").select("*").eq("client_id", clientId).order("date", { ascending: false }),
      supabase.from("client_payments").select("*").eq("client_id", clientId).order("payment_date", { ascending: false }),
      supabase.from("client_runs").select("*").eq("client_id", clientId).order("run_date", { ascending: false }),
    ]);
    if (docs.data) setDocuments(docs.data);
    if (pays.data) setPayments(pays.data);
    if (rns.data) setRuns(rns.data);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) fetchClientDetails(selectedClient.id);
  }, [selectedClient]);

  const saveClient = async () => {
    if (!form.name?.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    if (selectedClient) {
      await supabase.from("clients").update(form).eq("id", selectedClient.id);
      toast.success("Client mis à jour");
    } else {
      await supabase.from("clients").insert(form);
      toast.success("Client ajouté");
    }
    setShowForm(false);
    setForm({ name: "" });
    setSelectedClient(null);
    fetchClients();
  };

  const deleteClient = async (id: string) => {
    await supabase.from("clients").delete().eq("id", id);
    toast.success("Client supprimé");
    setSelectedClient(null);
    fetchClients();
  };

  const editClient = (client: Client) => {
    setForm({
      name: client.name,
      address: client.address || "",
      city: client.city || "",
      phone: client.phone || "",
      email: client.email || "",
      notes: client.notes || "",
      contract_status: client.contract_status || "non_signe",
      payment_status: client.payment_status || "en_attente",
    });
    setSelectedClient(client);
    setShowForm(true);
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // Client detail view
  if (selectedClient && !showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setSelectedClient(null)} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Button>
          <h1 className="text-sm font-semibold text-foreground truncate">{selectedClient.name}</h1>
          <div className="ml-auto flex gap-1">
            <Button size="sm" variant="outline" onClick={() => editClient(selectedClient)}>Modifier</Button>
            <Button size="sm" variant="destructive" onClick={() => deleteClient(selectedClient.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          {/* Client Info Card */}
          <div className="border border-border rounded-lg p-5 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Adresse:</span> {selectedClient.address}</div>
              <div><span className="text-muted-foreground">Ville:</span> {selectedClient.city}</div>
              <div><span className="text-muted-foreground">Tél:</span> {selectedClient.phone}</div>
              <div><span className="text-muted-foreground">Courriel:</span> {selectedClient.email}</div>
            </div>
            <div className="flex gap-2 mt-3">
              <Badge variant={statusColors[selectedClient.contract_status || "non_signe"] as any}>
                Contrat: {statusLabels[selectedClient.contract_status || "non_signe"]}
              </Badge>
              <Badge variant={statusColors[selectedClient.payment_status || "en_attente"] as any}>
                Paiement: {statusLabels[selectedClient.payment_status || "en_attente"]}
              </Badge>
            </div>
            {selectedClient.notes && (
              <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-3">{selectedClient.notes}</p>
            )}
          </div>

          {/* Quick document creation */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button size="sm" variant="outline" className="gap-1" onClick={() => {
              const params = new URLSearchParams({
                name: selectedClient.name,
                address: selectedClient.address || "",
                city: selectedClient.city || "",
                phone: selectedClient.phone || "",
                email: selectedClient.email || "",
              });
              navigate(`/soumission?${params.toString()}`);
            }}>
              <FileText className="h-3 w-3" /> Créer Soumission
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => {
              const params = new URLSearchParams({
                name: selectedClient.name,
                address: selectedClient.address || "",
                city: selectedClient.city || "",
                phone: selectedClient.phone || "",
                email: selectedClient.email || "",
              });
              navigate(`/facture?${params.toString()}`);
            }}>
              <DollarSign className="h-3 w-3" /> Créer Facture
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => {
              const params = new URLSearchParams({
                name: selectedClient.name,
                address: selectedClient.address || "",
                city: selectedClient.city || "",
                phone: selectedClient.phone || "",
                email: selectedClient.email || "",
              });
              navigate(`/contrat?${params.toString()}`);
            }}>
              <CalendarCheck className="h-3 w-3" /> Créer Contrat
            </Button>
          </div>

          {/* Tabs for documents, payments, runs */}
          <Tabs defaultValue="documents">
            <TabsList className="mb-4">
              <TabsTrigger value="documents" className="gap-1 text-xs"><FileText className="h-3 w-3" /> Documents</TabsTrigger>
              <TabsTrigger value="payments" className="gap-1 text-xs"><DollarSign className="h-3 w-3" /> Paiements</TabsTrigger>
              <TabsTrigger value="runs" className="gap-1 text-xs"><CalendarCheck className="h-3 w-3" /> Passages</TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun document</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border border-border rounded-lg p-3 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold capitalize">{doc.doc_type}</span>
                        {doc.doc_number && <span className="text-muted-foreground ml-2">#{doc.doc_number}</span>}
                        <span className="text-muted-foreground ml-2">{doc.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{Number(doc.amount).toFixed(2)}$</span>
                        <Badge variant="outline" className="ml-2 text-xs">{doc.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payments">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun paiement</p>
              ) : (
                <div className="space-y-2">
                  {payments.map((pay) => (
                    <div key={pay.id} className="border border-border rounded-lg p-3 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold">{Number(pay.amount).toFixed(2)}$</span>
                        <span className="text-muted-foreground ml-2">{pay.payment_date}</span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">{pay.method}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="runs">
              {runs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun passage</p>
              ) : (
                <div className="space-y-2">
                  {runs.map((run) => (
                    <div key={run.id} className="border border-border rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{run.run_date}</span>
                        <Badge variant={run.completed ? "default" : "secondary"}>
                          {run.completed ? "Complété" : "Planifié"}
                        </Badge>
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
  }

  // Form view
  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setForm({ name: "" }); }} className="gap-1">
            <ArrowLeft className="h-4 w-4" /> Annuler
          </Button>
          <h1 className="text-sm font-semibold text-foreground">
            {selectedClient ? "Modifier le client" : "Nouveau client"}
          </h1>
        </div>
        <div className="max-w-2xl mx-auto p-4 sm:p-8 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Nom / Entreprise *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Adresse</Label>
              <Input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Ville</Label>
              <Input value={form.city || ""} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Téléphone</Label>
              <Input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Courriel</Label>
              <Input value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <Textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="mt-1" />
          </div>
          <Button onClick={saveClient} className="w-full">
            {selectedClient ? "Enregistrer les modifications" : "Ajouter le client"}
          </Button>
        </div>
      </div>
    );
  }

  // Client list view
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <h1 className="text-sm font-semibold text-foreground">Gestion des clients</h1>
        <Button size="sm" onClick={() => setShowForm(true)} className="ml-auto gap-1">
          <Plus className="h-4 w-4" /> Nouveau
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun client trouvé</p>
            <Button size="sm" onClick={() => setShowForm(true)} className="mt-3 gap-1">
              <Plus className="h-4 w-4" /> Ajouter un client
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className="w-full text-left border border-border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{client.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {client.phone} {client.city && `— ${client.city}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={statusColors[client.contract_status || "non_signe"] as any} className="text-xs">
                      {statusLabels[client.contract_status || "non_signe"]}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsPage;
