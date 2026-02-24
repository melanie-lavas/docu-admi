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
      <div className="document-header-gradient rounded-t-lg p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <img src={logoEmj} alt="Logo E.M.J" className="w-14 h-14 sm:w-20 sm:h-20 rounded-lg object-cover" />
          <div className="text-primary-foreground">
            <h1 className="text-lg sm:text-2xl font-display font-bold">{companyInfo.name}</h1>
            <p className="text-xs sm:text-sm opacity-90">{companyInfo.subtitle}</p>
          </div>
        </div>
        <div className="text-primary-foreground text-center sm:text-right text-xs sm:text-sm">
          <p className="font-semibold">{companyInfo.owner}, {companyInfo.title}</p>
          <p>N.E.Q. {companyInfo.neq}</p>
          <p>📞 {companyInfo.phone}</p>
          <p>✉ {companyInfo.email}</p>
        </div>
      </div>

      {/* Document Title Bar */}
      <div className="bg-secondary border border-t-0 border-border rounded-b-lg px-4 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row justify-between items-center gap-1">
        <h2 className="text-base sm:text-xl font-display font-bold text-foreground uppercase tracking-wide">
          {documentType}
        </h2>
        <div className="flex gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
          <span>N° <strong className="text-foreground">{documentNumber || "___________"}</strong></span>
          <span>Date: <strong className="text-foreground">{date || "___________"}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;
