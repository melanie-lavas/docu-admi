import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Printer, FileText, Download } from "lucide-react";
import { companyInfo, calculateSubtotal, TPS_RATE, TVQ_RATE } from "@/lib/companyInfo";
import { generateFullDocumentPdf } from "@/lib/generateDocumentPdf";
import { imageToBase64 } from "@/lib/imageToBase64";
import { supabase } from "@/integrations/supabase/client";
import logoEmj from "@/assets/logo-emj.png";
import signatureImg from "@/assets/signature-max.png";

type DocType = "soumission" | "contrat-facture";

interface LineRow {
  id: string;
  description: string;
  qty: string;
  price: string;
}

const createRow = (): LineRow => ({
  id: crypto.randomUUID(),
  description: "",
  qty: "1",
  price: "",
});

const DocumentsVierges = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<DocType>("contrat-facture");

  // Editable fields
  const [docNumber, setDocNumber] = useState("");
  const [date, setDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [rows, setRows] = useState<LineRow[]>([createRow(), createRow(), createRow(), createRow(), createRow()]);
  const [montantConvenu, setMontantConvenu] = useState("");
  const [paymentOption, setPaymentOption] = useState<"" | "A" | "B">("");
  const [notes, setNotes] = useState("");

  const toggleService = (s: string) =>
    setSelectedServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const updateRow = (id: string, field: keyof LineRow, value: string) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const addRow = () => setRows((prev) => [...prev, createRow()]);
  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const subtotal = rows.reduce((s, r) => s + (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0), 0);
  const tps = subtotal * TPS_RATE;
  const tvq = subtotal * TVQ_RATE;
  const total = subtotal + tps + tvq;
  const fmt = (n: number) => n.toFixed(2) + " $";

  const handlePrint = () => window.print();

  const handlePdf = async () => {
    let logoB64: string | undefined;
    let sigB64: string | undefined;
    try { logoB64 = await imageToBase64(logoEmj); } catch {}
    try { sigB64 = await imageToBase64(signatureImg); } catch {}

    if (selectedType === "soumission") {
      generateFullDocumentPdf({
        docType: "soumission",
        docNumber,
        date,
        client: { name: clientName, address: clientAddress, city: clientCity, phone: clientPhone, email: clientEmail },
        items: rows.filter((r) => r.description.trim()).map((r) => ({
          id: r.id, description: r.description, quantity: parseFloat(r.qty) || 0, unitPrice: parseFloat(r.price) || 0,
        })),
        selectedServices,
        notes,
        paymentOption: "",
        logoBase64: logoB64,
        signatureBase64: sigB64,
      });
    } else {
      generateContratFacturePdf({
        docNumber, date,
        client: { name: clientName, address: clientAddress, city: clientCity, phone: clientPhone, email: clientEmail },
        items: rows.filter((r) => r.description.trim()).map((r) => ({
          id: r.id, description: r.description, quantity: parseFloat(r.qty) || 0, unitPrice: parseFloat(r.price) || 0,
        })),
        selectedServices, notes, paymentOption, montantConvenu,
        logoBase64: logoB64, signatureBase64: sigB64,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar */}
      <div className="no-print sticky top-0 z-10 bg-card border-b border-border px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Menu
        </Button>
        <Button size="sm" variant={selectedType === "contrat-facture" ? "default" : "outline"} onClick={() => setSelectedType("contrat-facture")} className="gap-1">
          Contrat & Facture
        </Button>
        <Button size="sm" variant={selectedType === "soumission" ? "default" : "outline"} onClick={() => setSelectedType("soumission")} className="gap-1">
          <FileText className="h-3.5 w-3.5" /> Soumission
        </Button>
        <Button size="sm" variant="outline" onClick={handlePdf} className="gap-1">
          <Download className="h-4 w-4" /> PDF
        </Button>
        <Button size="sm" onClick={handlePrint} className="gap-1">
          <Printer className="h-4 w-4" /> Imprimer
        </Button>
      </div>

      {/* Document */}
      <div className="p-4 sm:p-8">
        <div className="print-page bg-white text-black p-6 sm:p-8 max-w-[8.5in] mx-auto border border-border rounded-lg print:border-none print:rounded-none print:p-[0.3in]">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src={logoEmj} alt="Logo" className="w-14 h-14 rounded-lg object-cover" />
              <div>
                <h2 className="text-lg font-bold">{companyInfo.name}</h2>
                <p className="text-xs text-gray-600">{companyInfo.subtitle}</p>
                <p className="text-xs text-gray-500">{companyInfo.owner} — {companyInfo.phone}</p>
                <p className="text-xs text-gray-500">{companyInfo.email} | NEQ: {companyInfo.neq}</p>
              </div>
            </div>
            <div className="text-right text-xs space-y-1">
              <p className="font-bold text-sm text-black uppercase">
                {selectedType === "soumission" ? "Soumission" : "Contrat & Facture"}
              </p>
              <div className="flex items-center gap-1 justify-end">
                <span>N°</span>
                <Input value={docNumber} onChange={(e) => setDocNumber(e.target.value)} className="w-24 h-6 text-xs px-1 py-0 bg-gray-50 border-gray-300 print:border-gray-200" placeholder="___" />
              </div>
              <div className="flex items-center gap-1 justify-end">
                <span>Date</span>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-32 h-6 text-xs px-1 py-0 bg-gray-50 border-gray-300 print:border-gray-200" />
              </div>
            </div>
          </div>

          <hr className="border-t-2 border-blue-500 mb-3" />

          {/* Client */}
          <div className="border border-gray-200 rounded p-3 mb-3 bg-gray-50">
            <p className="text-xs font-bold mb-2 uppercase text-gray-600">Client</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-16 shrink-0">Nom:</span>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} className="h-6 text-xs px-1 py-0 bg-white border-gray-300" />
              </div>
              <div className="flex items-center gap-1">
                <span className="w-16 shrink-0">Tél:</span>
                <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="h-6 text-xs px-1 py-0 bg-white border-gray-300" />
              </div>
              <div className="flex items-center gap-1">
                <span className="w-16 shrink-0">Adresse:</span>
                <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="h-6 text-xs px-1 py-0 bg-white border-gray-300" />
              </div>
              <div className="flex items-center gap-1">
                <span className="w-16 shrink-0">Courriel:</span>
                <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="h-6 text-xs px-1 py-0 bg-white border-gray-300" />
              </div>
              <div className="flex items-center gap-1">
                <span className="w-16 shrink-0">Ville:</span>
                <Input value={clientCity} onChange={(e) => setClientCity(e.target.value)} className="h-6 text-xs px-1 py-0 bg-white border-gray-300" />
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="mb-3">
            <p className="text-xs font-bold uppercase text-gray-600 mb-2">Services</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
              {companyInfo.services.map((s) => (
                <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox checked={selectedServices.includes(s)} onCheckedChange={() => toggleService(s)} className="h-3 w-3" />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Line items */}
          <div className="mb-3">
            <p className="text-xs font-bold uppercase text-gray-600 mb-2">Description des travaux</p>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-blue-500 text-white">
                  <th className="text-left p-1.5 border border-blue-500">Description</th>
                  <th className="text-center p-1.5 border border-blue-500 w-14">Qté</th>
                  <th className="text-right p-1.5 border border-blue-500 w-24">Prix unit.</th>
                  <th className="text-right p-1.5 border border-blue-500 w-24">Total</th>
                  <th className="p-1 border border-blue-500 w-8 no-print"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const lineTotal = (parseFloat(r.qty) || 0) * (parseFloat(r.price) || 0);
                  return (
                    <tr key={r.id} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="p-0.5 border border-gray-200">
                        <Input value={r.description} onChange={(e) => updateRow(r.id, "description", e.target.value)} className="h-6 text-xs px-1 py-0 border-0 bg-transparent" />
                      </td>
                      <td className="p-0.5 border border-gray-200">
                        <Input value={r.qty} onChange={(e) => updateRow(r.id, "qty", e.target.value)} className="h-6 text-xs px-1 py-0 border-0 bg-transparent text-center" />
                      </td>
                      <td className="p-0.5 border border-gray-200">
                        <Input value={r.price} onChange={(e) => updateRow(r.id, "price", e.target.value)} className="h-6 text-xs px-1 py-0 border-0 bg-transparent text-right" placeholder="0.00" />
                      </td>
                      <td className="p-1.5 border border-gray-200 text-right font-medium">
                        {lineTotal > 0 ? fmt(lineTotal) : ""}
                      </td>
                      <td className="p-0.5 border border-gray-200 text-center no-print">
                        {rows.length > 1 && (
                          <button onClick={() => removeRow(r.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Button size="sm" variant="ghost" onClick={addRow} className="text-xs mt-1 h-6 no-print">
              + Ajouter une ligne
            </Button>

            {/* Totals */}
            <div className="flex justify-end mt-2">
              <div className="w-52 text-xs space-y-1">
                <div className="flex justify-between border-t border-gray-300 pt-1">
                  <span>Sous-total</span>
                  <span className="font-medium">{subtotal > 0 ? fmt(subtotal) : "—"}</span>
                </div>
                {selectedType === "contrat-facture" && (
                  <>
                    <div className="flex justify-between">
                      <span>TPS (5%)</span>
                      <span>{subtotal > 0 ? fmt(tps) : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVQ (9,975%)</span>
                      <span>{subtotal > 0 ? fmt(tvq) : "—"}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-bold border-t border-gray-400 pt-1 text-sm">
                  <span>TOTAL</span>
                  <span>{(selectedType === "contrat-facture" ? total : subtotal) > 0 ? fmt(selectedType === "contrat-facture" ? total : subtotal) : "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contrat & Facture specific sections */}
          {selectedType === "contrat-facture" && (
            <>
              {/* Montant convenu */}
              <div className="mb-3 text-xs">
                <p className="font-bold uppercase text-gray-600 mb-1">Montant convenu</p>
                <div className="flex items-center gap-1">
                  <Input value={montantConvenu} onChange={(e) => setMontantConvenu(e.target.value)} className="w-40 h-6 text-xs px-1 py-0 bg-gray-50 border-gray-300 font-bold" placeholder="0.00" />
                  <span className="font-bold">$</span>
                </div>
              </div>

              {/* Période */}
              <div className="mb-3 text-xs">
                <p className="font-bold uppercase text-gray-600 mb-1">Période du contrat</p>
                <p className="font-semibold">Du 1er mai 2026 au 15 octobre 2026 — 22 passages assurés.</p>
                <p className="mt-0.5">Entretien hebdomadaire sauf en cas d'urgence météo.</p>
              </div>

              {/* Options paiement */}
              <div className="mb-3 text-xs">
                <p className="font-bold uppercase text-gray-600 mb-1">Options de paiement</p>
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox checked={paymentOption === "A"} onCheckedChange={() => setPaymentOption(paymentOption === "A" ? "" : "A")} className="h-3 w-3" />
                    Option A — Paiement intégral avant le 1er mai 2026
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox checked={paymentOption === "B"} onCheckedChange={() => setPaymentOption(paymentOption === "B" ? "" : "B")} className="h-3 w-3" />
                    Option B — 2 versements égaux (15 avril 2026 et 15 août 2026)
                  </label>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Mode de paiement : Virement Interac au {companyInfo.phone} ou argent comptant.
                </p>
                <p className="text-[10px] text-gray-500 italic">Veuillez inscrire le numéro de document avec chaque paiement.</p>
              </div>

              {/* Clauses */}
              <div className="mb-3 text-xs">
                <p className="font-bold uppercase text-gray-600 mb-1">Clauses du contrat</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[10px] leading-tight">
                  <li>L'entrepreneur se réserve le droit de mettre fin au contrat sans préavis en cas de manque de respect ou de non-paiement.</li>
                  <li>L'entrepreneur n'est pas responsable des conditions météorologiques. En cas de pluie pendant trois jours consécutifs ou plus, il fera de son mieux malgré le retard.</li>
                  <li>Le gazon sera coupé à une hauteur de 3,5 pouces (1 à 2 passages selon les besoins).</li>
                  <li>Le client dispose de 24 heures après le service pour signaler toute insatisfaction.</li>
                  <li>Tout travail additionnel non prévu au contrat fera l'objet d'une soumission séparée.</li>
                </ol>
              </div>

              {/* Important */}
              <div className="mb-3 border border-red-200 bg-red-50 rounded p-2 text-[10px]">
                <p className="font-semibold text-red-600">⚠️ Important</p>
                <p>Vous devez retourner le contrat signé avant le début des services. Un paiement non fait ou un contrat non signé peut entraîner l'arrêt des services.</p>
              </div>
            </>
          )}

          {/* Notes */}
          <div className="mb-3 text-xs">
            <p className="font-bold uppercase text-gray-600 mb-1">Notes</p>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="text-xs bg-gray-50 border-gray-300 resize-none" placeholder="Notes additionnelles..." />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-4">
            <div>
              <img src={signatureImg} alt="Signature" className="h-16 mx-auto mb-1 object-contain" />
              <div className="border-t-2 border-black pt-1 text-xs text-center text-gray-600">
                Signature de l'entrepreneur
              </div>
              <p className="text-center text-[10px] text-gray-500 mt-0.5">{companyInfo.owner}</p>
            </div>
            <div>
              <div className="h-16" />
              <div className="border-t-2 border-black pt-1 text-xs text-center text-gray-600">
                Signature du client
              </div>
              {selectedType === "contrat-facture" && (
                <p className="text-center text-[10px] text-gray-500 mt-0.5">Date: _______________</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 pt-2 border-t border-gray-200 text-center text-[9px] text-gray-400">
            {companyInfo.name} — {companyInfo.phone} — {companyInfo.email} — NEQ: {companyInfo.neq}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsVierges;

// ── PDF generator for combined Contrat & Facture ──

import jsPDF from "jspdf";
import type { LineItem } from "@/lib/companyInfo";

interface ContratFactureData {
  docNumber: string;
  date: string;
  client: { name: string; address: string; city: string; phone: string; email: string };
  items: LineItem[];
  selectedServices: string[];
  notes: string;
  paymentOption: "" | "A" | "B";
  montantConvenu: string;
  logoBase64?: string;
  signatureBase64?: string;
}

function generateContratFacturePdf(data: ContratFactureData) {
  const { docNumber, date, client, items, selectedServices, notes, paymentOption, montantConvenu, logoBase64, signatureBase64 } = data;
  const pdf = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 16;
  const contentW = pageW - 2 * margin;
  let y = 16;

  const fmtP = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $";

  const checkPage = (needed: number) => {
    if (y + needed > pageH - 20) {
      pdf.addPage();
      y = 16;
    }
  };

  // Header
  if (logoBase64) {
    try { pdf.addImage(logoBase64, "PNG", margin, y - 2, 16, 16); } catch {}
  }
  const tx = logoBase64 ? margin + 19 : margin;
  pdf.setFontSize(16); pdf.setFont("helvetica", "bold");
  pdf.text(companyInfo.name, tx, y);
  y += 5; pdf.setFontSize(9); pdf.setFont("helvetica", "normal");
  pdf.text(companyInfo.subtitle, tx, y);
  y += 4; pdf.text(`${companyInfo.owner} — ${companyInfo.phone}`, tx, y);
  y += 4; pdf.text(`${companyInfo.email} | NEQ: ${companyInfo.neq}`, tx, y);
  y += 2;

  // Blue line
  pdf.setDrawColor(59, 130, 246); pdf.setLineWidth(0.8);
  pdf.line(margin, y, pageW - margin, y);
  y += 6;

  // Title
  pdf.setFontSize(14); pdf.setFont("helvetica", "bold");
  pdf.text("CONTRAT & FACTURE", margin, y);
  pdf.setFontSize(9); pdf.setFont("helvetica", "normal");
  const info: string[] = [];
  if (docNumber) info.push(`N° ${docNumber}`);
  if (date) info.push(`Date: ${date}`);
  if (info.length) pdf.text(info.join("  |  "), pageW - margin, y, { align: "right" });
  y += 8;

  // Client
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(margin, y, contentW, 26, 2, 2, "F");
  pdf.setFontSize(10); pdf.setFont("helvetica", "bold");
  pdf.text("Client", margin + 4, y + 6);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
  let cy = y + 11;
  if (client.name) { pdf.text(client.name, margin + 4, cy); cy += 4; }
  if (client.address) { pdf.text(client.address, margin + 4, cy); cy += 4; }
  if (client.city) { pdf.text(client.city, margin + 4, cy); }
  let ry = y + 11;
  if (client.phone) { pdf.text(`Tél: ${client.phone}`, pageW - margin - 4, ry, { align: "right" }); ry += 4; }
  if (client.email) { pdf.text(client.email, pageW - margin - 4, ry, { align: "right" }); }
  y += 30;

  // Services
  if (selectedServices.length > 0) {
    checkPage(8 + selectedServices.length * 4);
    pdf.setFontSize(10); pdf.setFont("helvetica", "bold");
    pdf.text("Services inclus", margin, y); y += 5;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
    selectedServices.forEach((s) => { pdf.text(`•  ${s}`, margin + 3, y); y += 4; });
    y += 3;
  }

  // Line items
  const validItems = items.filter((i) => i.description.trim());
  if (validItems.length > 0) {
    checkPage(12 + validItems.length * 7);
    pdf.setFontSize(10); pdf.setFont("helvetica", "bold");
    pdf.text("Description des travaux", margin, y); y += 6;

    // Table header
    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin, y, contentW, 7, "F");
    pdf.setTextColor(255); pdf.setFontSize(8); pdf.setFont("helvetica", "bold");
    pdf.text("Description", margin + 3, y + 5);
    pdf.text("Qté", margin + contentW * 0.6, y + 5, { align: "center" });
    pdf.text("Prix unit.", margin + contentW * 0.77, y + 5, { align: "right" });
    pdf.text("Total", pageW - margin - 3, y + 5, { align: "right" });
    y += 7; pdf.setTextColor(0);

    validItems.forEach((item, idx) => {
      checkPage(7);
      if (idx % 2 === 0) { pdf.setFillColor(250, 250, 252); pdf.rect(margin, y, contentW, 6, "F"); }
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
      const desc = item.description.length > 65 ? item.description.substring(0, 62) + "..." : item.description;
      pdf.text(desc, margin + 3, y + 4.5);
      pdf.text(String(item.quantity), margin + contentW * 0.6, y + 4.5, { align: "center" });
      pdf.text(fmtP(item.unitPrice), margin + contentW * 0.77, y + 4.5, { align: "right" });
      pdf.text(fmtP(item.quantity * item.unitPrice), pageW - margin - 3, y + 4.5, { align: "right" });
      y += 6;
    });

    // Totals
    y += 2;
    const sub = calculateSubtotal(validItems);
    const tpsV = sub * TPS_RATE;
    const tvqV = sub * TVQ_RATE;
    const tot = sub + tpsV + tvqV;

    pdf.setDrawColor(200); pdf.line(margin + contentW * 0.55, y, pageW - margin, y);
    y += 4; pdf.setFontSize(9); pdf.setFont("helvetica", "normal");
    pdf.text("Sous-total", margin + contentW * 0.55, y);
    pdf.text(fmtP(sub), pageW - margin - 3, y, { align: "right" }); y += 5;
    pdf.text("TPS (5%)", margin + contentW * 0.55, y);
    pdf.text(fmtP(tpsV), pageW - margin - 3, y, { align: "right" }); y += 4;
    pdf.text("TVQ (9,975%)", margin + contentW * 0.55, y);
    pdf.text(fmtP(tvqV), pageW - margin - 3, y, { align: "right" }); y += 5;

    pdf.setFillColor(59, 130, 246);
    pdf.roundedRect(margin + contentW * 0.5, y - 1, contentW * 0.5, 9, 2, 2, "F");
    pdf.setTextColor(255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(11);
    pdf.text("TOTAL", margin + contentW * 0.55, y + 5.5);
    pdf.text(fmtP(tot), pageW - margin - 4, y + 5.5, { align: "right" });
    pdf.setTextColor(0); y += 14;
  }

  // Montant convenu
  if (montantConvenu) {
    checkPage(12);
    pdf.setFontSize(10); pdf.setFont("helvetica", "bold");
    pdf.text("Montant convenu", margin, y); y += 6;
    pdf.setFontSize(12);
    pdf.text(`${parseFloat(montantConvenu).toFixed(2)} $`, margin, y);
    y += 8;
  }

  // Période
  checkPage(18);
  pdf.setFontSize(10); pdf.setFont("helvetica", "bold");
  pdf.text("Période du contrat", margin, y); y += 5;
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
  pdf.text("Du 1er mai 2026 au 15 octobre 2026 — 22 passages assurés.", margin, y); y += 4;
  pdf.text("Entretien hebdomadaire sauf en cas d'urgence météo.", margin, y); y += 7;

  // Payment options
  checkPage(18);
  pdf.setFontSize(10); pdf.setFont("helvetica", "bold");
  pdf.text("Options de paiement", margin, y); y += 5;
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);

  const optA = paymentOption === "A" ? "☑" : "☐";
  const optB = paymentOption === "B" ? "☑" : "☐";
  pdf.text(`${optA}  Option A — Paiement intégral avant le 1er mai 2026`, margin + 2, y); y += 5;
  pdf.text(`${optB}  Option B — 2 versements égaux (15 avril 2026 et 15 août 2026)`, margin + 2, y); y += 5;
  pdf.setFontSize(8);
  pdf.text(`Mode de paiement : Virement Interac au ${companyInfo.phone} ou argent comptant.`, margin, y); y += 4;
  pdf.setFont("helvetica", "italic");
  pdf.text("Veuillez inscrire le numéro de document avec chaque paiement.", margin, y);
  pdf.setFont("helvetica", "normal"); y += 7;

  // Clauses
  checkPage(30);
  pdf.setFontSize(10); pdf.setFont("helvetica", "bold");
  pdf.text("Clauses du contrat", margin, y); y += 5;
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
  const clauses = [
    "1. L'entrepreneur se réserve le droit de mettre fin au contrat sans préavis en cas de manque de respect ou de non-paiement.",
    "2. L'entrepreneur n'est pas responsable des conditions météorologiques. En cas de pluie pendant trois jours consécutifs ou plus, il fera de son mieux malgré le retard.",
    "3. Le gazon sera coupé à une hauteur de 3,5 pouces (1 à 2 passages selon les besoins).",
    "4. Le client dispose de 24 heures après le service pour signaler toute insatisfaction.",
    "5. Tout travail additionnel non prévu au contrat fera l'objet d'une soumission séparée.",
  ];
  clauses.forEach((c) => {
    checkPage(7);
    const lines = pdf.splitTextToSize(c, contentW);
    pdf.text(lines, margin, y);
    y += lines.length * 3.5 + 2;
  });
  y += 3;

  // Important
  checkPage(14);
  pdf.setFillColor(254, 242, 242);
  pdf.roundedRect(margin, y, contentW, 12, 2, 2, "F");
  pdf.setFontSize(8); pdf.setFont("helvetica", "bold"); pdf.setTextColor(220, 38, 38);
  pdf.text("⚠️ Important", margin + 3, y + 4.5);
  pdf.setFont("helvetica", "normal"); pdf.setTextColor(0); pdf.setFontSize(7);
  pdf.text("Vous devez retourner le contrat signé avant le début des services. Un paiement non fait ou un contrat non signé peut entraîner l'arrêt des services.", margin + 3, y + 9);
  y += 16;

  // Notes
  if (notes) {
    checkPage(12);
    pdf.setFontSize(10); pdf.setFont("helvetica", "bold");
    pdf.text("Notes", margin, y); y += 5;
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(9);
    const nl = pdf.splitTextToSize(notes, contentW);
    pdf.text(nl, margin, y); y += nl.length * 4 + 4;
  }

  // Signatures
  checkPage(40);
  const sigY = Math.max(y + 10, pageH - 45);
  const finalSigY = sigY + 25 > pageH - 12 ? (() => { pdf.addPage(); return 40; })() : sigY;

  if (signatureBase64) {
    try { pdf.addImage(signatureBase64, "PNG", margin, finalSigY - 16, 50, 16); } catch {}
  }
  pdf.setDrawColor(0); pdf.setLineWidth(0.5);
  pdf.line(margin, finalSigY, margin + 65, finalSigY);
  pdf.setFontSize(8); pdf.setFont("helvetica", "normal");
  pdf.text("Signature de l'entrepreneur", margin, finalSigY + 4);
  pdf.text(companyInfo.owner, margin, finalSigY + 8);

  pdf.line(pageW - margin - 65, finalSigY, pageW - margin, finalSigY);
  pdf.text("Signature du client", pageW - margin - 65, finalSigY + 4);
  pdf.text("Date: _______________", pageW - margin - 65, finalSigY + 8);

  // Footer
  pdf.setFontSize(7); pdf.setTextColor(150);
  pdf.text(`${companyInfo.name} — ${companyInfo.phone} — ${companyInfo.email} — NEQ: ${companyInfo.neq}`, pageW / 2, pageH - 8, { align: "center" });

  const cn = client.name.replace(/\s+/g, "_") || "client";
  pdf.save(`Contrat-Facture${docNumber ? `-${docNumber}` : ""}-${cn}.pdf`);
}
