import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Users, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logoEmj from "@/assets/logo-emj.png";

interface RunEntry {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  done: boolean;
  remarks: string;
}

const emptyRow = (): RunEntry => ({
  id: crypto.randomUUID(),
  name: "",
  address: "",
  city: "",
  phone: "",
  done: false,
  remarks: "",
});

const STORAGE_KEY = "emj-run-gazon";

const RunGazon = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<RunEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return Array.from({ length: 15 }, () => emptyRow());
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  // Sort entries by city then by street name for logical route order
  const sortByRoute = () => {
    setEntries((prev) => {
      const filled = prev.filter((e) => e.name.trim());
      const empty = prev.filter((e) => !e.name.trim());
      
      filled.sort((a, b) => {
        // Group by city first
        const cityCompare = (a.city || "").localeCompare(b.city || "", "fr");
        if (cityCompare !== 0) return cityCompare;
        
        // Then sort by street name (ignore house number)
        const streetA = (a.address || "").replace(/^\d+\s*/, "");
        const streetB = (b.address || "").replace(/^\d+\s*/, "");
        const streetCompare = streetA.localeCompare(streetB, "fr");
        if (streetCompare !== 0) return streetCompare;
        
        // Same street: sort by house number
        const numA = parseInt((a.address || "").match(/^(\d+)/)?.[1] || "0");
        const numB = parseInt((b.address || "").match(/^(\d+)/)?.[1] || "0");
        return numA - numB;
      });
      
      return [...filled, ...empty];
    });
    toast.success("Clients triés par trajet logique (ville → rue → numéro)");
  };

  const loadClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("name, address, city, phone")
        .order("city")
        .order("address");

      if (error) throw error;
      if (!data || data.length === 0) {
        toast.error("Aucun client trouvé");
        setLoading(false);
        return;
      }

      // Check which clients are already in the run (by name)
      const existingNames = new Set(entries.filter(e => e.name.trim()).map(e => e.name.trim().toLowerCase()));
      const newClients = data.filter(c => !existingNames.has(c.name.trim().toLowerCase()));

      if (newClients.length === 0) {
        toast.info("Tous les clients sont déjà dans la run");
        setLoading(false);
        return;
      }

      const clientEntries: RunEntry[] = newClients.map((c) => ({
        id: crypto.randomUUID(),
        name: c.name || "",
        address: c.address || "",
        city: c.city || "",
        phone: c.phone || "",
        done: false,
        remarks: "",
      }));

      // Sort by city then street for logical route
      clientEntries.sort((a, b) => {
        const cityCompare = a.city.localeCompare(b.city, "fr");
        if (cityCompare !== 0) return cityCompare;
        const streetA = a.address.replace(/^\d+\s*/, "");
        const streetB = b.address.replace(/^\d+\s*/, "");
        const streetCompare = streetA.localeCompare(streetB, "fr");
        if (streetCompare !== 0) return streetCompare;
        const numA = parseInt(a.address.match(/^(\d+)/)?.[1] || "0");
        const numB = parseInt(b.address.match(/^(\d+)/)?.[1] || "0");
        return numA - numB;
      });

      // Keep existing filled entries, remove empty ones, add new clients
      setEntries((prev) => {
        const filled = prev.filter((e) => e.name.trim());
        return [...filled, ...clientEntries, ...Array.from({ length: 3 }, () => emptyRow())];
      });

      toast.success(`${newClients.length} clients ajoutés et triés par trajet`);
    } catch (err) {
      toast.error("Erreur lors du chargement des clients");
    }
    setLoading(false);
  };

  const updateEntry = (id: string, field: keyof RunEntry, value: string | boolean) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addRows = (count: number) => {
    setEntries((prev) => [...prev, ...Array.from({ length: count }, () => emptyRow())]);
  };

  const deleteRow = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const clearDone = () => {
    setEntries((prev) => prev.filter((e) => !e.done));
    toast.success("Entrées complétées supprimées");
  };

  const doneCount = entries.filter((e) => e.done).length;
  const filledCount = entries.filter((e) => e.name.trim()).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Button>
        <img src={logoEmj} alt="Logo" className="h-7 w-7 rounded object-cover" />
        <h1 className="text-sm font-bold text-foreground truncate">Run de Gazon — EMJ</h1>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span>{doneCount}/{filledCount} fait</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        {/* Actions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button size="sm" variant="default" onClick={loadClients} disabled={loading} className="gap-1">
            <Users className="h-3 w-3" /> {loading ? "Chargement..." : "Charger les clients"}
          </Button>
          <Button size="sm" variant="outline" onClick={sortByRoute} className="gap-1">
            <ArrowUpDown className="h-3 w-3" /> Trier par trajet
          </Button>
          <Button size="sm" variant="outline" onClick={() => addRows(5)} className="gap-1">
            <Plus className="h-3 w-3" /> 5 lignes
          </Button>
          <Button size="sm" variant="outline" onClick={() => addRows(10)} className="gap-1">
            <Plus className="h-3 w-3" /> 10 lignes
          </Button>
          {doneCount > 0 && (
            <Button size="sm" variant="secondary" onClick={clearDone} className="gap-1">
              <Trash2 className="h-3 w-3" /> Retirer les complétés ({doneCount})
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-2 text-left font-semibold text-xs text-muted-foreground w-10">Fait</th>
                <th className="p-2 text-left font-semibold text-xs text-muted-foreground min-w-[140px]">Nom</th>
                <th className="p-2 text-left font-semibold text-xs text-muted-foreground min-w-[160px]">Adresse</th>
                <th className="p-2 text-left font-semibold text-xs text-muted-foreground min-w-[100px]">Ville</th>
                <th className="p-2 text-left font-semibold text-xs text-muted-foreground min-w-[120px]">Téléphone</th>
                <th className="p-2 text-left font-semibold text-xs text-muted-foreground min-w-[140px]">Remarque</th>
                <th className="p-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.id}
                  className={`border-b border-border transition-colors ${
                    entry.done ? "bg-primary/5" : i % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  <td className="p-2 text-center">
                    <Checkbox
                      checked={entry.done}
                      onCheckedChange={(v) => updateEntry(entry.id, "done", !!v)}
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      value={entry.name}
                      onChange={(e) => updateEntry(entry.id, "name", e.target.value)}
                      placeholder="Nom du client"
                      className={`h-8 text-xs border-0 bg-transparent focus-visible:ring-1 ${entry.done ? "line-through text-muted-foreground" : ""}`}
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      value={entry.address}
                      onChange={(e) => updateEntry(entry.id, "address", e.target.value)}
                      placeholder="Adresse"
                      className={`h-8 text-xs border-0 bg-transparent focus-visible:ring-1 ${entry.done ? "line-through text-muted-foreground" : ""}`}
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      value={entry.city}
                      onChange={(e) => updateEntry(entry.id, "city", e.target.value)}
                      placeholder="Ville"
                      className={`h-8 text-xs border-0 bg-transparent focus-visible:ring-1 ${entry.done ? "line-through text-muted-foreground" : ""}`}
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      value={entry.phone}
                      onChange={(e) => updateEntry(entry.id, "phone", e.target.value)}
                      placeholder="819-000-0000"
                      className={`h-8 text-xs border-0 bg-transparent focus-visible:ring-1 ${entry.done ? "line-through text-muted-foreground" : ""}`}
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      value={entry.remarks}
                      onChange={(e) => updateEntry(entry.id, "remarks", e.target.value)}
                      placeholder="Remarque..."
                      className={`h-8 text-xs border-0 bg-transparent focus-visible:ring-1 ${entry.done ? "text-muted-foreground" : ""}`}
                    />
                  </td>
                  <td className="p-1">
                    {entry.name.trim() === "" && (
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => deleteRow(entry.id)}>
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Les données sont sauvegardées automatiquement sur cet appareil.
        </p>
      </div>
    </div>
  );
};

export default RunGazon;
