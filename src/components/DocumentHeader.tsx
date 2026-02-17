import { companyInfo } from "@/lib/companyInfo";
import logoEmj from "@/assets/logo-emj.png";

interface DocumentHeaderProps {
  documentType: string;
  documentNumber?: string;
  date?: string;
}

const DocumentHeader = ({ documentType, documentNumber, date }: DocumentHeaderProps) => {
  return (
    <div className="mb-6">
      {/* Company Banner */}
      <div className="document-header-gradient rounded-t-lg p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={logoEmj} alt="Logo E.M.J" className="w-20 h-20 rounded-lg object-cover" />
          <div className="text-primary-foreground">
            <h1 className="text-2xl font-display font-bold">{companyInfo.name}</h1>
            <p className="text-sm opacity-90">{companyInfo.subtitle}</p>
          </div>
        </div>
        <div className="text-primary-foreground text-right text-sm">
          <p className="font-semibold">{companyInfo.owner}, {companyInfo.title}</p>
          <p>N.E.Q. {companyInfo.neq}</p>
          <p>📞 {companyInfo.phone}</p>
          <p>✉ {companyInfo.email}</p>
        </div>
      </div>

      {/* Document Title Bar */}
      <div className="bg-secondary border border-t-0 border-border rounded-b-lg px-6 py-3 flex justify-between items-center">
        <h2 className="text-xl font-display font-bold text-foreground uppercase tracking-wide">
          {documentType}
        </h2>
        <div className="flex gap-6 text-sm text-muted-foreground">
          {documentNumber && (
            <span>N° <strong className="text-foreground">{documentNumber}</strong></span>
          )}
          <span>Date: <strong className="text-foreground">{date || new Date().toLocaleDateString("fr-CA")}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;
