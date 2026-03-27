import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Save, Package } from "lucide-react";
import { toast } from "sonner";

interface SavedService {
  id: string;
  description: string;
  unit_price: number;
}

const ServicesPage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<SavedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase.from("saved_services").select("*").order("description");
    if (data) setServices(data);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, []);

  const addService = async () => {
    if (!newDesc.trim()) { toast.error("Description requise"); return; }
    const price = parseFloat(newPrice.replace(",", ".")) || 0;
    const { error } = await supabase.from("saved_services").insert({ description: newDesc.trim(), unit_price: price });
    if (error) toast.error("Erreur");
    else {
      toast.success("Service ajouté");
      setNewDesc("");
      setNewPrice("");
      fetchServices();
    }
  };

  const startEdit = (s: SavedService) => {
    setEditingId(s.id);
    setEditDesc(s.description);
    setEditPrice(s.unit_price.toString());
  };

  const saveEdit = async () => {
    if (!editingId || !editDesc.trim()) return;
    const price = parseFloat(editPrice.replace(",", ".")) || 0;
    const { error } = await supabase.from("saved_services").update({ description: editDesc.trim(), unit_price: price }).eq("id", editingId);
    if (error) toast.error("Erreur");
    else {
      toast.success("Service modifié");
      setEditingId(null);
      fetchServices();
    }
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase.from("saved_services").delete().eq("id", id);
    if (error) toast.error("Erreur");
    else {
      toast.success("Service supprimé");
      fetchServices();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <h1 className="text-sm font-semibold text-foreground">Banque de services</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        {/* Add form */}
        <div className="border border-border rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Ajouter un service</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Ex: Tonte de gazon résidentiel" className="mt-1" />
            </div>
            <div className="w-full sm:w-32">
              <Label className="text-xs text-muted-foreground">Prix ($)</Label>
              <Input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0.00" className="mt-1" />
            </div>
            <div className="flex items-end">
              <Button onClick={addService} className="gap-1 w-full sm:w-auto">
                <Plus className="h-4 w-4" /> Ajouter
              </Button>
            </div>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Aucun service enregistré</p>
            <p className="text-xs text-muted-foreground mt-1">Ajoutez vos services ci-dessus pour les réutiliser dans vos documents.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {services.map((s) => (
              <div key={s.id} className="border border-border rounded-lg p-3">
                {editingId === s.id ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="flex-1 text-sm" />
                    <Input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full sm:w-28 text-sm" />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={saveEdit} className="gap-1">
                        <Save className="h-3 w-3" /> OK
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{s.description}</p>
                      <p className="text-xs text-muted-foreground">{s.unit_price.toFixed(2)} $</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(s)} className="text-xs h-7">Modifier</Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteService(s.id)} className="h-7 w-7 p-0">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
