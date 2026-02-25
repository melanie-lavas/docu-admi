export interface EmailTemplate {
  id: string;
  category: string;
  title: string;
  subject: string;
  body: string;
}

export const emailTemplates: EmailTemplate[] = [
  // Soumission
  {
    id: "soumission-envoi",
    category: "Soumission",
    title: "Envoi de soumission",
    subject: "Soumission — Les Entreprises E.M.J",
    body: `Bonjour [Nom du client],

Merci de votre intérêt pour nos services d'entretien paysager.

Vous trouverez ci-joint notre soumission détaillée pour les services discutés. N'hésitez pas à nous contacter si vous avez des questions ou si vous souhaitez apporter des modifications.

La soumission est valide pour une durée de 30 jours.

Au plaisir de travailler avec vous!

Cordialement,
Maxime Jutras
Les Entreprises E.M.J
819-293-7675`,
  },
  {
    id: "soumission-relance",
    category: "Soumission",
    title: "Relance soumission",
    subject: "Suivi — Soumission Les Entreprises E.M.J",
    body: `Bonjour [Nom du client],

Je me permets de faire un suivi concernant la soumission que nous vous avons envoyée le [date].

Si vous avez des questions ou si vous aimeriez discuter des options, je suis disponible à votre convenance.

N'hésitez pas à me contacter.

Cordialement,
Maxime Jutras
Les Entreprises E.M.J
819-293-7675`,
  },
  // Facture
  {
    id: "facture-envoi",
    category: "Facture",
    title: "Envoi de facture",
    subject: "Facture #[numéro] — Les Entreprises E.M.J",
    body: `Bonjour [Nom du client],

Veuillez trouver ci-joint la facture #[numéro] pour les services rendus.

Mode de paiement : Virement Interac au 819-293-7675 ou argent comptant.
Veuillez inscrire le numéro de facture avec chaque paiement.

Merci de votre confiance!

Cordialement,
Maxime Jutras
Les Entreprises E.M.J
819-293-7675`,
  },
  // Paiement
  {
    id: "paiement-confirmation",
    category: "Paiement",
    title: "Confirmation de paiement",
    subject: "Confirmation de paiement — Les Entreprises E.M.J",
    body: `Bonjour [Nom du client],

Nous confirmons la réception de votre paiement de [montant]$ pour la facture #[numéro].

Merci beaucoup!

Cordialement,
Maxime Jutras
Les Entreprises E.M.J
819-293-7675`,
  },
  {
    id: "paiement-rappel",
    category: "Paiement",
    title: "Rappel de paiement",
    subject: "Rappel de paiement — Facture #[numéro]",
    body: `Bonjour [Nom du client],

Nous souhaitons vous rappeler que la facture #[numéro] d'un montant de [montant]$ est toujours en attente de paiement.

Nous vous prions de bien vouloir effectuer le paiement dans les meilleurs délais.

Mode de paiement : Virement Interac au 819-293-7675 ou argent comptant.

Merci de votre collaboration.

Cordialement,
Maxime Jutras
Les Entreprises E.M.J
819-293-7675`,
  },
  // Retard
  {
    id: "retard-paiement",
    category: "Retard",
    title: "Avis de retard de paiement",
    subject: "AVIS — Retard de paiement — Facture #[numéro]",
    body: `Bonjour [Nom du client],

La facture #[numéro] d'un montant de [montant]$ est en souffrance depuis le [date d'échéance].

Veuillez noter qu'un paiement non fait ou un contrat non signé peut entraîner l'arrêt des services, tel que mentionné dans les clauses de votre contrat.

Nous vous demandons de régulariser la situation dans les plus brefs délais.

Cordialement,
Maxime Jutras
Les Entreprises E.M.J
819-293-7675`,
  },
  {
    id: "retard-contrat",
    category: "Retard",
    title: "Rappel contrat non signé",
    subject: "Rappel — Contrat à retourner signé",
    body: `Bonjour [Nom du client],

Nous n'avons toujours pas reçu votre contrat de service signé pour la saison 2026.

Vous devez retourner le contrat signé avant le début des services. Un contrat non signé peut entraîner l'arrêt ou le report des services.

Merci de nous le retourner dans les meilleurs délais.

Cordialement,
Maxime Jutras
Les Entreprises E.M.J
819-293-7675`,
  },
  // Renouvellement
  {
    id: "renouvellement",
    category: "Renouvellement",
    title: "Offre de renouvellement",
    subject: "Renouvellement de contrat — Saison 2027",
    body: `Bonjour [Nom du client],

La saison d'entretien 2026 tire à sa fin et nous espérons que nos services vous ont donné satisfaction.

Nous vous offrons la possibilité de renouveler votre contrat pour la saison 2027. Les détails et tarifs vous seront envoyés sous peu.

Merci de nous confirmer votre intérêt.

Au plaisir,
Maxime Jutras
Les Entreprises E.M.J
819-293-7675`,
  },
];
