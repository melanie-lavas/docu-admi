import jsPDF from "jspdf";
import { companyInfo } from "./companyInfo";
import type { Tables } from "@/integrations/supabase/types";

type Client = Tables<"clients">;
type ClientDocument = Tables<"client_documents">;

const docTypeLabels: Record<string, string> = {
  facture: "Facture",
  contrat: "Contrat de Service",
  soumission: "Soumission",
};

export function generateDocumentPdf(client: Client, doc: ClientDocument) {
  const pdf = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // ── Header: Company info ──
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(companyInfo.name, margin, y);
  y += 6;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(companyInfo.subtitle, margin, y);
  y += 5;
  pdf.text(`${companyInfo.owner} — ${companyInfo.phone}`, margin, y);
  y += 5;
  pdf.text(`Courriel: ${companyInfo.email} | NEQ: ${companyInfo.neq}`, margin, y);
  y += 3;

  // Separator
  pdf.setDrawColor(59, 130, 246);
  pdf.setLineWidth(0.8);
  pdf.line(margin, y, pageW - margin, y);
  y += 10;

  // ── Document title ──
  const docLabel = docTypeLabels[doc.doc_type] || doc.doc_type;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(docLabel, margin, y);

  // Number & date on the right
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const rightInfo: string[] = [];
  if (doc.doc_number) rightInfo.push(`N° ${doc.doc_number}`);
  if (doc.date) rightInfo.push(`Date: ${doc.date}`);
  if (rightInfo.length > 0) {
    pdf.text(rightInfo.join("  |  "), pageW - margin, y, { align: "right" });
  }
  y += 12;

  // ── Client info ──
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("Client", margin, y);
  y += 6;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  const clientLines = [
    client.name,
    client.address,
    client.city,
    client.phone ? `Tél: ${client.phone}` : "",
    client.email ? `Courriel: ${client.email}` : "",
  ].filter(Boolean);

  clientLines.forEach((line) => {
    pdf.text(line, margin, y);
    y += 5;
  });
  y += 5;

  // ── Amount box ──
  pdf.setFillColor(245, 247, 250);
  pdf.roundedRect(margin, y, pageW - 2 * margin, 20, 3, 3, "F");
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Montant total", margin + 8, y + 13);
  const amount = Number(doc.amount).toFixed(2);
  pdf.setFontSize(14);
  pdf.text(`${amount} $`, pageW - margin - 8, y + 13, { align: "right" });
  y += 28;

  // ── Notes ──
  if (doc.notes) {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Notes", margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const noteLines = pdf.splitTextToSize(doc.notes, pageW - 2 * margin);
    pdf.text(noteLines, margin, y);
    y += noteLines.length * 5 + 5;
  }

  // ── Contract specific sections ──
  if (doc.doc_type === "contrat") {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Période du contrat", margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Valide du 1er mai 2026 au 15 octobre 2026 — 22 passages assurés.", margin, y);
    y += 10;

    // Clauses
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Clauses", margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const clauses = [
      "1. L'entrepreneur se réserve le droit de mettre fin au contrat sans préavis en cas de manque de respect ou de non-paiement.",
      "2. L'entrepreneur n'est pas responsable des conditions météorologiques.",
      "3. Le gazon sera coupé à une hauteur de 3 pouces.",
      "4. Le client dispose de 24h après le service pour signaler toute insatisfaction.",
      "5. Tout travail additionnel fera l'objet d'une soumission séparée.",
    ];
    clauses.forEach((c) => {
      const lines = pdf.splitTextToSize(c, pageW - 2 * margin);
      pdf.text(lines, margin, y);
      y += lines.length * 4 + 2;
    });
    y += 5;
  }

  // ── Invoice payment terms ──
  if (doc.doc_type === "facture") {
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Modalités de paiement", margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Virement Interac au 819-293-7675 ou argent comptant.", margin, y);
    y += 5;
    pdf.text("Veuillez inscrire le numéro de facture avec chaque paiement.", margin, y);
    y += 10;
  }

  // ── Signature lines ──
  const sigY = Math.max(y + 10, 220);
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.5);
  // Entrepreneur
  pdf.line(margin, sigY, margin + 70, sigY);
  pdf.setFontSize(9);
  pdf.text("Signature de l'entrepreneur", margin, sigY + 5);
  pdf.text(companyInfo.owner, margin, sigY + 10);
  // Client
  pdf.line(pageW - margin - 70, sigY, pageW - margin, sigY);
  pdf.text("Signature du client", pageW - margin - 70, sigY + 5);

  // ── Footer ──
  const footerY = pdf.internal.pageSize.getHeight() - 12;
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  pdf.text(`${companyInfo.name} — ${companyInfo.phone} — ${companyInfo.email}`, pageW / 2, footerY, { align: "center" });

  // Save
  const fileName = `${docLabel}${doc.doc_number ? `-${doc.doc_number}` : ""}-${client.name.replace(/\s+/g, "_")}.pdf`;
  pdf.save(fileName);
}
