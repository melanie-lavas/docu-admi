import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
  notes: string | null;
  created_at: string;
}

const categories: Record<string, string> = {
  essence: "⛽ Essence",
  equipement: "🔧 Équipement",
  materiel: "🧱 Matériel",
  vehicule: "🚗 Véhicule",
  assurance: "🛡️ Assurance",
  telephone: "📱 Téléphone",
  publicite: "📢 Publicité",
  autre: "📦 Autre",
};

const DepensesPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "autre",
    expense_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const fetchExpenses = async () => {
    const { data } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
    if (data) setExpenses(data);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const saveExpense = async () => {
    if (!form.description.trim() || !form.amount) {
      toast.error("Description et montant requis");
      return;
    }
    const { error } = await supabase.from("expenses").insert({
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      expense_date: form.expense_date,
      notes: form.notes || "",
    });
    if (error) toast.error("Erreur");
    else {
      toast.success("Dépense ajoutée");
      setShowForm(false);
      setForm({ description: "", amount: "", category: "autre", expense_date: new Date().toISOString().split("T")[0], notes: "" });
      fetchExpenses();
    }
  };

  const deleteExpense = async (id: string) => {
    await supabase.from("expenses").delete().eq("id", id);
    toast.success("Dépense supprimée");
    fetchExpenses();
  };

  const filtered = filterCategory === "all" ? expenses : expenses.filter((e) => e.category === filterCategory);
  const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <h1 className="text-sm font-semibold text-foreground">Suivi des dépenses</h1>
        <Button size="sm" onClick={() => setShowForm(true)} className="ml-auto gap-1">
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        {showForm && (
          <div className="border border-border rounded-lg p-4 mb-6 space-y-3">
            <h3 className="text-sm font-semibold">Nouvelle dépense</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Description *</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" placeholder="Ex: Plein d'essence..." />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Montant ($) *</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1" placeholder="0.00" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categories).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" placeholder="Optionnel..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={saveExpense}>Enregistrer</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </div>
        )}

        {/* Filter + Total */}
        <div className="flex items-center gap-3 mb-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Toutes catégories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {Object.entries(categories).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center gap-1 text-sm font-semibold">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Total: {total.toFixed(2)}$
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Aucune dépense enregistrée</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((exp) => (
              <div key={exp.id} className="border border-border rounded-lg p-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold text-foreground">{exp.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {exp.expense_date} {exp.notes && `— ${exp.notes}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{categories[exp.category] || exp.category}</Badge>
                  <span className="font-semibold">{Number(exp.amount).toFixed(2)}$</span>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => deleteExpense(exp.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepensesPage;
