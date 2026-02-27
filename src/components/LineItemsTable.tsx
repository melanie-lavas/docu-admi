import { useState } from "react";
import type { LineItem } from "@/lib/companyInfo";
import { createLineItem, calculateSubtotal, TPS_RATE, TVQ_RATE } from "@/lib/companyInfo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface LineItemsTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
  showTaxes?: boolean;
}

// Parse a string that may use comma as decimal separator
const parseNum = (val: string): number => {
  const cleaned = val.replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
};

const LineItemsTable = ({ items, onChange, showTaxes = true }: LineItemsTableProps) => {
  // Track raw text values for quantity and price so user can type freely (commas, empty, etc.)
  const [rawValues, setRawValues] = useState<Record<string, { qty?: string; price?: string }>>({});

  const addItem = () => onChange([...items, createLineItem()]);
  const removeItem = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
    setRawValues((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };
  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleNumChange = (id: string, field: "quantity" | "unitPrice", raw: string) => {
    const key = field === "quantity" ? "qty" : "price";
    setRawValues((prev) => ({ ...prev, [id]: { ...prev[id], [key]: raw } }));
    updateItem(id, field, parseNum(raw));
  };

  const getRaw = (id: string, field: "quantity" | "unitPrice", actual: number): string => {
    const key = field === "quantity" ? "qty" : "price";
    const r = rawValues[id]?.[key];
    if (r !== undefined) return r;
    return actual === 0 ? "" : String(actual);
  };

  const subtotal = calculateSubtotal(items);
  const tps = subtotal * TPS_RATE;
  const tvq = subtotal * TVQ_RATE;
  const total = subtotal + (showTaxes ? tps + tvq : 0);

  const fmt = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $";

  return (
    <div className="mb-6">
      {/* Table */}
      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="document-header-gradient text-primary-foreground">
              <th className="text-left p-2 sm:p-3 font-semibold">Description</th>
              <th className="text-center p-2 sm:p-3 font-semibold w-16 sm:w-24">Qté</th>
              <th className="text-right p-2 sm:p-3 font-semibold w-24 sm:w-32">Prix unit.</th>
              <th className="text-right p-2 sm:p-3 font-semibold w-24 sm:w-32">Total</th>
              <th className="text-center p-2 sm:p-3 w-10 sm:w-12 no-print"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? "bg-card" : "bg-secondary/50"}>
                <td className="p-2">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Description du service"
                    className="border-0 shadow-none bg-transparent"
                  />
                </td>
                <td className="p-2">
                  <Input
                    inputMode="decimal"
                    value={getRaw(item.id, "quantity", item.quantity)}
                    onChange={(e) => handleNumChange(item.id, "quantity", e.target.value)}
                    placeholder="1"
                    className="border-0 shadow-none bg-transparent text-center"
                  />
                </td>
                <td className="p-2">
                  <Input
                    inputMode="decimal"
                    value={getRaw(item.id, "unitPrice", item.unitPrice)}
                    onChange={(e) => handleNumChange(item.id, "unitPrice", e.target.value)}
                    placeholder="0,00"
                    className="border-0 shadow-none bg-transparent text-right"
                  />
                </td>
                <td className="p-2 text-right font-medium text-foreground">
                  {item.quantity * item.unitPrice > 0 ? fmt(item.quantity * item.unitPrice) : ""}
                </td>
                <td className="p-2 text-center no-print">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add button */}
      <Button variant="outline" size="sm" onClick={addItem} className="mt-3 no-print">
        <Plus className="h-4 w-4 mr-1" /> Ajouter une ligne
      </Button>

      {/* Totals */}
      <div className="flex justify-end mt-4">
        <div className="w-72 space-y-1 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="font-medium">{fmt(subtotal)}</span>
          </div>
          {showTaxes && (
            <>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">TPS (5%)</span>
                <span>{fmt(tps)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">TVQ (9,975%)</span>
                <span>{fmt(tvq)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-2 border-t-2 border-primary font-bold text-base">
            <span>Total</span>
            <span className="text-primary">{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineItemsTable;
