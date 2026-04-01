import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const prefixMap: Record<string, string> = {
  soumission: "S",
  contrat: "C",
  facture: "F",
};

export function useAutoDocNumber(
  docType: string,
  docId: string,
  currentNumber: string,
  setNumber: (n: string) => void
) {
  useEffect(() => {
    // Skip if editing existing doc or number already set
    if (docId || currentNumber) return;

    const prefix = prefixMap[docType] || "D";

    const fetchNext = async () => {
      const { data } = await supabase
        .from("client_documents")
        .select("doc_number")
        .eq("doc_type", docType);

      let max = 0;
      (data || []).forEach((row) => {
        const num = row.doc_number || "";
        // Extract numeric part from patterns like "S-001", "001", "S001", "1"
        const match = num.replace(/^[A-Za-z]-?/, "").match(/(\d+)/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (n > max) max = n;
        }
      });

      setNumber(`${prefix}-${String(max + 1).padStart(3, "0")}`);
    };

    fetchNext();
  }, [docType, docId, currentNumber, setNumber]);
}
