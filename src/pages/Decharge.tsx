import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Printer } from "lucide-react";
import { companyInfo } from "@/lib/companyInfo";
import logoEmj from "@/assets/logo-emj.png";

const Decharge = () => {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [serviceDescription, setServiceDescription] = useState("");

  return (
    <div className="min-h-screen bg-background">
      {/* Screen-only controls */}
      <div className="print:hidden p-4 border-b border-border flex items-center gap-3 bg-card">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <h1 className="text-lg font-bold text-foreground flex-1">Décharge légale — Émondage / Élagage</h1>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-4 w-4 mr-1" /> Imprimer
        </Button>
      </div>

      {/* Printable document */}
      <div className="max-w-[8.5in] mx-auto bg-white text-black p-10 print:p-[0.75in] print:m-0 print:max-w-none print:shadow-none shadow-lg my-6 print:my-0" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "11pt", lineHeight: "1.5" }}>

        {/* Header */}
        <div className="flex items-start gap-4 mb-2">
          <img src={logoEmj} alt="Logo E.M.J" className="w-16 h-16 object-cover rounded" />
          <div className="flex-1">
            <h1 className="text-xl font-bold m-0">{companyInfo.name}</h1>
            <p className="text-sm text-gray-600 m-0">{companyInfo.subtitle}</p>
            <p className="text-sm text-gray-600 m-0">{companyInfo.owner} — {companyInfo.phone}</p>
            <p className="text-sm text-gray-600 m-0">{companyInfo.email} | N.E.Q. {companyInfo.neq}</p>
          </div>
        </div>

        <hr className="border-t-2 border-blue-600 my-4" />

        {/* Title */}
        <h2 className="text-center text-lg font-bold uppercase tracking-wide mb-1">
          Décharge de responsabilité
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Services d'émondage et d'élagage d'arbres
        </p>

        {/* Date & client info */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 print:gap-2">
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Date du service</label>
              <Input value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} type="date" className="print:border-0 print:bg-transparent print:p-0 print:h-auto text-black bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Téléphone du client</label>
              <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(xxx) xxx-xxxx" className="print:border-0 print:bg-transparent print:p-0 print:h-auto text-black bg-white" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Nom complet du client</label>
              <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Prénom et nom du client" className="print:border-0 print:bg-transparent print:p-0 print:h-auto text-black bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Adresse des travaux</label>
              <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Adresse complète" className="print:border-0 print:bg-transparent print:p-0 print:h-auto text-black bg-white" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Ville</label>
              <Input value={clientCity} onChange={(e) => setClientCity(e.target.value)} placeholder="Ville" className="print:border-0 print:bg-transparent print:p-0 print:h-auto text-black bg-white" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Description des travaux</label>
              <Input value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} placeholder="Ex: Élagage d'un érable mature, émondage de 3 cèdres..." className="print:border-0 print:bg-transparent print:p-0 print:h-auto text-black bg-white" />
            </div>
          </div>
        </div>

        {/* Legal text */}
        <div className="space-y-4 text-[10.5pt] text-justify">
          <p>
            <strong>ENTRE :</strong> {companyInfo.name}, représentée par {companyInfo.owner}, entrepreneur, ci-après désigné « <strong>l'Entrepreneur</strong> »;
          </p>
          <p>
            <strong>ET :</strong> Le client identifié ci-dessus, ci-après désigné « <strong>le Client</strong> ».
          </p>

          <h3 className="font-bold text-sm uppercase mt-6 mb-2">1. Objet</h3>
          <p>
            La présente décharge concerne les travaux d'émondage et/ou d'élagage d'arbres effectués à l'adresse du Client à la date indiquée ci-dessus. Le Client reconnaît avoir demandé et autorisé l'exécution desdits travaux.
          </p>

          <h3 className="font-bold text-sm uppercase mt-6 mb-2">2. Assurance de l'entreprise</h3>
          <p>
            L'Entrepreneur déclare détenir une assurance responsabilité civile commerciale valide couvrant ses activités professionnelles, incluant les travaux d'émondage et d'élagage. Une copie du certificat d'assurance peut être fournie sur demande.
          </p>

          <h3 className="font-bold text-sm uppercase mt-6 mb-2">3. Reconnaissance des risques</h3>
          <p>
            Le Client reconnaît que les travaux d'émondage et d'élagage comportent des risques inhérents, notamment mais sans s'y limiter : la chute de branches, les dommages possibles au gazon, aux plates-bandes ou aux structures adjacentes, ainsi que les variations esthétiques résultant de la coupe. L'Entrepreneur s'engage à effectuer les travaux avec diligence et selon les règles de l'art.
          </p>

          <h3 className="font-bold text-sm uppercase mt-6 mb-2">4. Décharge de responsabilité</h3>
          <p>
            Par la présente, le Client dégage {companyInfo.name} et son représentant, {companyInfo.owner}, de toute responsabilité pour :
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Les dommages mineurs au terrain (gazon, plates-bandes) causés par la chute contrôlée de branches;</li>
            <li>Les résultats esthétiques de la coupe, pour autant que les travaux aient été effectués selon les consignes convenues;</li>
            <li>Tout dommage préexistant à la propriété non signalé avant le début des travaux;</li>
            <li>Les conséquences naturelles liées à la santé de l'arbre après les travaux (maladies, sécheresse, etc.).</li>
          </ul>

          <h3 className="font-bold text-sm uppercase mt-6 mb-2">5. Obligations du client</h3>
          <p>Le Client s'engage à :</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Signaler toute infrastructure souterraine ou aérienne (fils électriques, câbles, conduites) à proximité des arbres;</li>
            <li>Dégager la zone de travail de tout objet personnel ou mobilier extérieur;</li>
            <li>Tenir les enfants et animaux domestiques à l'écart de la zone de travail pendant toute la durée des opérations.</li>
          </ul>

          <h3 className="font-bold text-sm uppercase mt-6 mb-2">6. Disposition générale</h3>
          <p>
            La présente décharge ne libère pas l'Entrepreneur en cas de faute lourde ou de négligence grave. Cette décharge est régie par les lois en vigueur dans la province de Québec. Le Client déclare avoir lu, compris et accepté les termes de la présente décharge avant le début des travaux.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-12 grid grid-cols-2 gap-12">
          <div>
            <div className="border-b border-black mb-1 h-12"></div>
            <p className="text-xs font-bold">Signature du client</p>
            <p className="text-xs text-gray-500 mt-1">Nom : ___________________________</p>
            <p className="text-xs text-gray-500 mt-1">Date : ___________________________</p>
          </div>
          <div>
            <div className="border-b border-black mb-1 h-12"></div>
            <p className="text-xs font-bold">Signature de l'entrepreneur</p>
            <p className="text-xs text-gray-500 mt-1">{companyInfo.owner}</p>
            <p className="text-xs text-gray-500 mt-1">{companyInfo.name}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-3 border-t border-gray-300 text-center text-[8pt] text-gray-400">
          <p>{companyInfo.name} — {companyInfo.phone} — {companyInfo.email} — N.E.Q. {companyInfo.neq}</p>
          <p className="mt-1">Ce document constitue un accord légal entre les parties. Chaque partie conserve un exemplaire signé.</p>
        </div>
      </div>
    </div>
  );
};

export default Decharge;
