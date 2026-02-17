import { companyInfo } from "@/lib/companyInfo";

const DocumentFooter = () => (
  <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
    <p className="font-semibold text-foreground">{companyInfo.name}</p>
    <p>{companyInfo.owner} — {companyInfo.phone} — {companyInfo.email} — N.E.Q. {companyInfo.neq}</p>
    <p className="mt-1 italic">Merci de votre confiance!</p>
  </div>
);

export default DocumentFooter;
