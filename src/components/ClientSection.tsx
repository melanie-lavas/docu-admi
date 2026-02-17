import type { ClientInfo } from "@/lib/companyInfo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClientSectionProps {
  client: ClientInfo;
  onChange: (client: ClientInfo) => void;
  readOnly?: boolean;
}

const ClientSection = ({ client, onChange, readOnly = false }: ClientSectionProps) => {
  const update = (field: keyof ClientInfo, value: string) => {
    onChange({ ...client, [field]: value });
  };

  return (
    <div className="border border-border rounded-lg p-5 mb-6">
      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">
        Informations du client
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-muted-foreground text-xs">Nom / Entreprise</Label>
          <Input
            value={client.name}
            onChange={(e) => update("name", e.target.value)}
            readOnly={readOnly}
            placeholder="Nom du client"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Téléphone</Label>
          <Input
            value={client.phone}
            onChange={(e) => update("phone", e.target.value)}
            readOnly={readOnly}
            placeholder="(819) 000-0000"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Adresse</Label>
          <Input
            value={client.address}
            onChange={(e) => update("address", e.target.value)}
            readOnly={readOnly}
            placeholder="123 Rue Exemple"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Courriel</Label>
          <Input
            value={client.email}
            onChange={(e) => update("email", e.target.value)}
            readOnly={readOnly}
            placeholder="client@exemple.com"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-muted-foreground text-xs">Ville</Label>
          <Input
            value={client.city}
            onChange={(e) => update("city", e.target.value)}
            readOnly={readOnly}
            placeholder="Ville, Province, Code postal"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientSection;
