import { companyInfo } from "@/lib/companyInfo";
import { Input } from "@/components/ui/input";
import logoEmj from "@/assets/logo-emj.png";

interface DocumentHeaderProps {
  documentType: string;
  documentNumber?: string;
  date?: string;
  onDocNumberChange?: (value: string) => void;
  onDateChange?: (value: string) => void;
}

const DocumentHeader = ({ documentType, documentNumber, date, onDocNumberChange, onDateChange }: DocumentHeaderProps) => {
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
      <div className="bg-secondary border border-t-0 border-border rounded-b-lg px-4 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
        <h2 className="text-base sm:text-xl font-display font-bold text-foreground uppercase tracking-wide">
          {documentType}
        </h2>
        <div className="flex gap-2 sm:gap-4 items-center text-xs sm:text-sm">
          {onDocNumberChange ? (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">N°</span>
              <Input
                value={documentNumber || ""}
                onChange={(e) => onDocNumberChange(e.target.value)}
                placeholder="001"
                className="w-20 h-7 text-xs font-semibold"
              />
            </div>
          ) : (
            <span className="text-muted-foreground">N° <strong className="text-foreground">{documentNumber || "___________"}</strong></span>
          )}
          {onDateChange ? (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Date:</span>
              <Input
                type="date"
                value={date || ""}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-36 h-7 text-xs font-semibold"
              />
            </div>
          ) : (
            <span className="text-muted-foreground">Date: <strong className="text-foreground">{date || "___________"}</strong></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;
