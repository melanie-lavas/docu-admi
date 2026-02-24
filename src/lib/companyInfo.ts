export const companyInfo = {
  name: "Les Entreprises E.M.J",
  subtitle: "Entretien Paysager & Services Extérieurs",
  owner: "Maxime Jutras",
  title: "Entrepreneur",
  neq: "2281793358",
  phone: "819-293-7675",
  email: "lesentreprisesemj@gmail.com",
  services: [
    "Tonte de pelouse",
    "Taille de haies",
    "Élagage",
    "Terreautage",
    "Aération du sol",
    "Nettoyage de gouttières",
    "Ramassage de feuilles",
    "Entretien de plates bandes",
    "Nettoyage de stationnements et pavés",
    "Déneigement manuel et toitures",
    "Ouverture de terrain",
    "Fermeture de terrain",
    "Autres",
  ],
};

export interface ClientInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export const emptyClient: ClientInfo = {
  name: "",
  address: "",
  city: "",
  phone: "",
  email: "",
};

export const createLineItem = (): LineItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  unitPrice: 0,
});

export const calculateSubtotal = (items: LineItem[]) =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

export const TPS_RATE = 0.05;
export const TVQ_RATE = 0.09975;
