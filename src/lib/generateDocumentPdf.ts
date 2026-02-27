import jsPDF from "jspdf";
import { companyInfo, calculateSubtotal, TPS_RATE, TVQ_RATE } from "./companyInfo";
import type { ClientInfo, LineItem } from "./companyInfo";
import type { Tables } from "@/integrations/supabase/types";

type Client = Tables<"clients">;
type ClientDocument = Tables<"client_documents">;

const docTypeLabels: Record<string, string> = {
  facture: "Facture",
  contrat: "Contrat de Service",
  soumission: "Soumission",
};

export interface FullDocumentData {
  docType: "soumission" | "facture" | "contrat";
  docNumber: string;
  date: string;
  client: ClientInfo;
  items: LineItem[];
  selectedServices: string[];
  notes: string;
  paymentOption: "" | "1" | "2";
  totalPrice?: string;
  logoBase64?: string;
  signatureBase64?: string;
}

const fmt = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " $";

export function generateFullDocumentPdf(data: FullDocumentData) {
  const { docType, docNumber, date, client, items, selectedServices, notes, paymentOption, totalPrice, logoBase64, signatureBase64 } = data;
  const pdf = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - 2 * margin;
  let y = 18;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageH - 25) {
      pdf.addPage();
      y = 18;
    }
  };

  // ── Header: Logo + Company info ──
  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, "PNG", margin, y - 2, 18, 18);
    } catch {}
  }
  const textX = logoBase64 ? margin + 22 : margin;
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(companyInfo.name, textX, y);
  y += 6;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(companyInfo.subtitle, textX, y);
  y += 5;
  pdf.text(`${companyInfo.owner} — ${companyInfo.phone}`, textX, y);
  y += 5;
  pdf.text(`Courriel: ${companyInfo.email} | NEQ: ${companyInfo.neq}`, textX, y);
  y += 3;

  // Blue separator
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(0.8);
  pdf.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Document title ──
  const docLabel = docTypeLabels[docType] || docType;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(docLabel.toUpperCase(), margin, y);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const rightInfo: string[] = [];
  if (docNumber) rightInfo.push(`N° ${docNumber}`);
  if (date) rightInfo.push(`Date: ${date}`);
  if (rightInfo.length > 0) {
    pdf.text(rightInfo.join("  |  "), pageW - margin, y, { align: "right" });
  }
  y += 10;

  // ── Client info ──
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(margin, y, contentW, 30, 2, 2, "F");
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("Client", margin + 5, y + 7);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  let cy = y + 13;
  if (client.name) { pdf.text(client.name, margin + 5, cy); cy += 5; }
  if (client.address) { pdf.text(client.address, margin + 5, cy); cy += 5; }
  if (client.city) { pdf.text(client.city, margin + 5, cy); cy += 5; }
  // Phone & email on right side
  let ry = y + 13;
  if (client.phone) { pdf.text(`Tél: ${client.phone}`, pageW - margin - 5, ry, { align: "right" }); ry += 5; }
  if (client.email) { pdf.text(client.email, pageW - margin - 5, ry, { align: "right" }); ry += 5; }
  y += 34;

  // ── Services checklist (contrat & soumission only — not on facture) ──
  if (selectedServices.length > 0 && docType !== "facture") {
    checkPageBreak(10 + selectedServices.length * 5);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Services inclus", margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    selectedServices.forEach((s) => {
      pdf.text(`•  ${s}`, margin + 3, y);
      y += 5;
    });
    y += 4;
  }

  // ── Line items table ──
  const validItems = items.filter((i) => i.description.trim());
  if (validItems.length > 0) {
    checkPageBreak(15 + validItems.length * 8);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Description des travaux", margin, y);
    y += 7;

    // Table header
    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin, y, contentW, 8, "F");
    pdf.setTextColor(255);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text("Description", margin + 3, y + 5.5);
    pdf.text("Qté", margin + contentW * 0.6, y + 5.5, { align: "center" });
    pdf.text("Prix unit.", margin + contentW * 0.75, y + 5.5, { align: "right" });
    pdf.text("Total", pageW - margin - 3, y + 5.5, { align: "right" });
    y += 8;
    pdf.setTextColor(0);

    // Table rows
    validItems.forEach((item, idx) => {
      checkPageBreak(8);
      if (idx % 2 === 0) {
        pdf.setFillColor(250, 250, 252);
        pdf.rect(margin, y, contentW, 7, "F");
      }
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      
      // Truncate long descriptions
      const desc = item.description.length > 60 ? item.description.substring(0, 57) + "..." : item.description;
      pdf.text(desc, margin + 3, y + 5);
      pdf.text(String(item.quantity), margin + contentW * 0.6, y + 5, { align: "center" });
      pdf.text(fmt(item.unitPrice), margin + contentW * 0.75, y + 5, { align: "right" });
      pdf.text(fmt(item.quantity * item.unitPrice), pageW - margin - 3, y + 5, { align: "right" });
      y += 7;
    });

    // Totals
    y += 2;
    const subtotal = calculateSubtotal(validItems);
    const showTaxes = docType === "facture";

    // Subtotal
    pdf.setDrawColor(200);
    pdf.line(margin + contentW * 0.55, y, pageW - margin, y);
    y += 5;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Sous-total", margin + contentW * 0.55, y);
    pdf.text(fmt(subtotal), pageW - margin - 3, y, { align: "right" });
    y += 6;

    if (showTaxes) {
      const tps = subtotal * TPS_RATE;
      const tvq = subtotal * TVQ_RATE;
      const total = subtotal + tps + tvq;

      pdf.text("TPS (5%)", margin + contentW * 0.55, y);
      pdf.text(fmt(tps), pageW - margin - 3, y, { align: "right" });
      y += 5;
      pdf.text("TVQ (9,975%)", margin + contentW * 0.55, y);
      pdf.text(fmt(tvq), pageW - margin - 3, y, { align: "right" });
      y += 6;

      // Total box
      pdf.setFillColor(59, 130, 246);
      pdf.roundedRect(margin + contentW * 0.5, y - 1, contentW * 0.5, 10, 2, 2, "F");
      pdf.setTextColor(255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("TOTAL", margin + contentW * 0.55, y + 6);
      pdf.text(fmt(total), pageW - margin - 5, y + 6, { align: "right" });
      pdf.setTextColor(0);
      y += 16;
    } else {
      // Total box (no taxes)
      pdf.setFillColor(59, 130, 246);
      pdf.roundedRect(margin + contentW * 0.5, y - 1, contentW * 0.5, 10, 2, 2, "F");
      pdf.setTextColor(255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("TOTAL", margin + contentW * 0.55, y + 6);
      pdf.text(fmt(subtotal), pageW - margin - 5, y + 6, { align: "right" });
      pdf.setTextColor(0);
      y += 16;
    }
  }

  // ── Contrat: montant convenu ──
  if (docType === "contrat" && totalPrice) {
    checkPageBreak(20);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Montant convenu", margin, y);
    y += 7;
    pdf.setFontSize(14);
    pdf.text(`${parseFloat(totalPrice).toFixed(2)} $`, margin, y);
    pdf.setFontSize(10);
    y += 10;
  }

  // ── Payment options ──
  if ((docType === "facture" || docType === "contrat") && paymentOption) {
    checkPageBreak(25);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Modalités de paiement", margin, y);
    y += 7;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    // Payment option box
    pdf.setFillColor(245, 247, 250);
    const payBoxH = paymentOption === "2" ? 28 : 22;
    pdf.roundedRect(margin, y, contentW, payBoxH, 2, 2, "F");

    if (paymentOption === "1") {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Paiement intégral", margin + 5, y + 6);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text("Payable en totalité avant le 1er mai 2026.", margin + 5, y + 12);
      pdf.text("Mode de paiement : Virement Interac au 819-293-7675 ou argent comptant.", margin + 5, y + 17);
    } else if (paymentOption === "2") {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Paiement en 2 versements égaux", margin + 5, y + 6);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text("1er versement : 15 avril 2026", margin + 5, y + 12);
      pdf.text("2e versement : 15 août 2026", margin + 5, y + 17);
      pdf.text("Mode de paiement : Virement Interac au 819-293-7675 ou argent comptant.", margin + 5, y + 23);
    }
    y += payBoxH + 3;

    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(100);
    pdf.text("Veuillez inscrire le numéro de document avec chaque paiement.", margin, y);
    pdf.setTextColor(0);
    pdf.setFont("helvetica", "normal");
    y += 8;
  }

  // ── Contrat: period & clauses ──
  if (docType === "contrat") {
    checkPageBreak(20);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Période du contrat", margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Valide du 1er mai 2026 au 15 octobre 2026 — 22 passages assurés.", margin, y);
    y += 5;
    pdf.text("Entretien hebdomadaire sauf en cas d'urgence météo.", margin, y);
    y += 10;

    checkPageBreak(35);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Clauses du contrat", margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const clauses = [
      "1. L'entrepreneur se réserve le droit de mettre fin au contrat sans préavis en cas de manque de respect ou de non-paiement.",
      "2. L'entrepreneur n'est pas responsable des conditions météorologiques. En cas de pluie pendant trois jours consécutifs ou plus, il fera de son mieux malgré le retard.",
      "3. Le gazon sera coupé à une hauteur de 3 pouces (1 à 2 passages selon les besoins).",
      "4. Le client dispose de 24 heures après le service pour signaler toute insatisfaction. Passé ce délai, aucune plainte ne sera prise en considération.",
      "5. Tout travail additionnel non prévu au contrat fera l'objet d'une soumission séparée.",
    ];
    clauses.forEach((c) => {
      checkPageBreak(8);
      const lines = pdf.splitTextToSize(c, contentW);
      pdf.text(lines, margin, y);
      y += lines.length * 4 + 2;
    });
    y += 5;
  }

  // ── Important notice (facture & contrat) ──
  if (docType === "facture" || docType === "contrat") {
    checkPageBreak(15);
    pdf.setFillColor(254, 242, 242);
    pdf.roundedRect(margin, y, contentW, 14, 2, 2, "F");
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(220, 38, 38);
    pdf.text("⚠️ Important", margin + 4, y + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0);
    pdf.setFontSize(8);
    pdf.text(
      "Vous devez retourner le contrat signé avant le début des services. Un paiement non fait ou un contrat non signé peut entraîner l'arrêt des services.",
      margin + 4, y + 10
    );
    y += 18;
  }

  // ── Notes ──
  if (notes) {
    checkPageBreak(15);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Notes", margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const noteLines = pdf.splitTextToSize(notes, contentW);
    pdf.text(noteLines, margin, y);
    y += noteLines.length * 5 + 5;
  }

  // ── Signatures ──
  checkPageBreak(50);
  const sigY = Math.max(y + 15, pageH - 50);
  if (sigY + 30 > pageH - 15) {
    pdf.addPage();
  }
  const finalSigY = (sigY + 30 > pageH - 15) ? 50 : sigY;

  pdf.setDrawColor(0);
  pdf.setLineWidth(0.5);
  // Entrepreneur — signature image
  if (signatureBase64) {
    try {
      // Detect format from data URL
      const imgFormat = signatureBase64.includes("image/jpeg") ? "JPEG" : "PNG";
      pdf.addImage(signatureBase64, imgFormat, margin, finalSigY - 20, 55, 20);
    } catch (e) {
      console.error("PDF signature addImage failed:", e);
    }
  }
  pdf.line(margin, finalSigY, margin + 70, finalSigY);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Signature de l'entrepreneur", margin, finalSigY + 5);
  pdf.text(companyInfo.owner, margin, finalSigY + 10);
  // Client
  pdf.line(pageW - margin - 70, finalSigY, pageW - margin, finalSigY);
  pdf.text("Signature du client", pageW - margin - 70, finalSigY + 5);
  if (docType === "contrat") {
    pdf.text("Date: _______________", pageW - margin - 70, finalSigY + 10);
  }

  // ── Footer ──
  const footerY = pageH - 10;
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  pdf.text(
    `${companyInfo.name} — ${companyInfo.phone} — ${companyInfo.email} — NEQ: ${companyInfo.neq}`,
    pageW / 2, footerY, { align: "center" }
  );

  // Save
  const clientName = client.name.replace(/\s+/g, "_") || "client";
  const fileName = `${docLabel}${docNumber ? `-${docNumber}` : ""}-${clientName}.pdf`;
  pdf.save(fileName);
}

// Keep legacy function for backward compatibility
export function generateDocumentPdf(client: Tables<"clients">, doc: ClientDocument) {
  generateFullDocumentPdf({
    docType: (doc.doc_type as "soumission" | "facture" | "contrat") || "soumission",
    docNumber: doc.doc_number || "",
    date: doc.date || "",
    client: {
      name: client.name,
      address: client.address || "",
      city: client.city || "",
      phone: client.phone || "",
      email: client.email || "",
    },
    items: [],
    selectedServices: [],
    notes: doc.notes || "",
    paymentOption: "",
  });
}
