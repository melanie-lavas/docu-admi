import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Search, User } from "lucide-react";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import ClientDetailView from "@/components/ClientDetailView";

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

  useEffect(() => { fetchClients(); }, []);
  useEffect(() => { if (selectedClient) fetchClientDetails(selectedClient.id); }, [selectedClient]);

  const handleRefresh = () => {
    if (selectedClient) {
      // Re-fetch client data too
      supabase.from("clients").select("*").eq("id", selectedClient.id).single().then(({ data }) => {
        if (data) setSelectedClient(data);
      });
      fetchClientDetails(selectedClient.id);
    }
  };

  const saveClient = async () => {
    if (!form.name?.trim()) { toast.error("Le nom est requis"); return; }
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
      <ClientDetailView
        client={selectedClient}
        documents={documents}
        payments={payments}
        runs={runs}
        onBack={() => setSelectedClient(null)}
        onEdit={editClient}
        onDelete={deleteClient}
        onRefresh={handleRefresh}
      />
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
          <Input placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
