import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AgendaEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  client_id: string | null;
  event_type: string;
  completed: boolean | null;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

const eventTypes: Record<string, string> = {
  rdv: "📅 Rendez-vous",
  soumission: "📝 Soumission",
  travaux: "🔨 Travaux",
  rappel: "🔔 Rappel",
  paiement: "💰 Paiement",
  autre: "📌 Autre",
};

const AgendaPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    event_date: new Date().toISOString().split("T")[0],
    event_time: "",
    client_id: "",
    event_type: "rdv",
  });

  const fetchEvents = async () => {
    const { data } = await supabase.from("agenda_events").select("*").order("event_date", { ascending: true });
    if (data) setEvents(data);
  };

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("id, name").order("name");
    if (data) setClients(data);
  };

  useEffect(() => { fetchEvents(); fetchClients(); }, []);

  const saveEvent = async () => {
    if (!form.title.trim()) { toast.error("Titre requis"); return; }
    const { error } = await supabase.from("agenda_events").insert({
      title: form.title,
      description: form.description || "",
      event_date: form.event_date,
      event_time: form.event_time || "",
      client_id: form.client_id || null,
      event_type: form.event_type,
    });
    if (error) toast.error("Erreur");
    else {
      toast.success("Événement ajouté");
      setShowForm(false);
      setForm({ title: "", description: "", event_date: new Date().toISOString().split("T")[0], event_time: "", client_id: "", event_type: "rdv" });
      fetchEvents();
    }
  };

  const toggleCompleted = async (id: string, completed: boolean) => {
    await supabase.from("agenda_events").update({ completed: !completed }).eq("id", id);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("agenda_events").delete().eq("id", id);
    toast.success("Événement supprimé");
    fetchEvents();
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter((e) => !e.completed && e.event_date >= today);
  const past = events.filter((e) => !e.completed && e.event_date < today);
  const completed = events.filter((e) => e.completed);

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId)?.name;
  };

  const renderEvent = (event: AgendaEvent) => (
    <div key={event.id} className={`border border-border rounded-lg p-3 text-sm ${event.completed ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Checkbox
            checked={!!event.completed}
            onCheckedChange={() => toggleCompleted(event.id, !!event.completed)}
            className="mt-0.5"
          />
          <div>
            <div className={`font-semibold ${event.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {event.title}
            </div>
            <div className="text-xs text-muted-foreground">
              {event.event_date} {event.event_time && `à ${event.event_time}`}
              {getClientName(event.client_id) && ` — ${getClientName(event.client_id)}`}
            </div>
            {event.description && (
              <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs whitespace-nowrap">{eventTypes[event.event_type] || event.event_type}</Badge>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteEvent(event.id)}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <h1 className="text-sm font-semibold text-foreground">Agenda</h1>
        <Button size="sm" onClick={() => setShowForm(true)} className="ml-auto gap-1">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        {showForm && (
          <div className="border border-border rounded-lg p-4 mb-6 space-y-3">
            <h3 className="text-sm font-semibold">Nouvel événement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <Label className="text-xs text-muted-foreground">Titre *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1" placeholder="Ex: Soumission chez M. Tremblay" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date *</Label>
                <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Heure</Label>
                <Input type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventTypes).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Client (optionnel)</Label>
                <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" placeholder="Détails optionnels..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEvent}>Enregistrer</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </div>
        )}

        {/* En retard */}
        {past.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-destructive uppercase mb-2">⚠️ En retard ({past.length})</h3>
            <div className="space-y-2">{past.map(renderEvent)}</div>
          </div>
        )}

        {/* À venir */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            <Calendar className="h-3 w-3 inline mr-1" />À venir ({upcoming.length})
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun événement à venir</p>
          ) : (
            <div className="space-y-2">{upcoming.map(renderEvent)}</div>
          )}
        </div>

        {/* Complétés */}
        {completed.length > 0 && (
          <div>
            <Button size="sm" variant="ghost" onClick={() => setShowCompleted(!showCompleted)} className="gap-1 text-xs text-muted-foreground mb-2">
              <CheckCircle2 className="h-3 w-3" />
              {showCompleted ? "Masquer" : "Voir"} complétés ({completed.length})
            </Button>
            {showCompleted && <div className="space-y-2">{completed.map(renderEvent)}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaPage;
