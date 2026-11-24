import { PROFILE_FIELDS } from './profileFields';

export type TemplateField = {
  fieldId: string;
  label?: string;
  required?: boolean;
};

export type TemplateSection = {
  title: string;
  fields: TemplateField[];
};

export type FormTemplate = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  cta: string;
  sections: TemplateSection[];
  checklist: string[];
  notes: string[];
  extraField?: { id: string; label: string };
};

export const DEMENAGEMENT_ORGANISMES = [
  'Impôts (impots.gouv.fr, rubrique « Signaler un changement de situation »)',
  'Caisse d\'allocations familiales (CAF) — mel@caf.fr',
  'Assurance maladie (CPAM) — ameli.fr',
  'Caisse de retraite',
  'Banque et organisme de crédit',
  'Assurance habitation (nouveau contrat à la date d\'entrée)',
  'Fournisseur d\'électricité et de gaz (résiliation + nouveaux contrats)',
  'Fournisseur d\'eau de l\'ancien et du nouveau logement',
  'Opérateur internet et mobile (transfert de ligne)',
  'Employeur (service RH et paie)',
  'Établissements scolaires des enfants',
  'Préfecture (carte grise, permis, titre de séjour)',
  'Médecin traitant, pharmacie, mutuelle',
  'Clubs, abonnements et fidelités (salle de sport, presse…)',
];

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'impots',
    title: 'Déclaration de revenus',
    subtitle: 'Préparation complète avant la saisie sur impots.gouv.fr',
    icon: 'template',
    color: '#60A5FA',
    cta: 'Générer ma fiche fiscale',
    sections: [
      {
        title: 'Vous',
        fields: [
          { fieldId: 'civil.prenom', required: true },
          { fieldId: 'civil.nom', required: true },
          { fieldId: 'civil.dateNaissance' },
          { fieldId: 'civil.paysNaissance' },
          { fieldId: 'civil.situationFamiliale' },
          { fieldId: 'civil.enfantsACharge' },
          { fieldId: 'domicile.adresse', required: true, label: 'Adresse au 1er janvier de l\'année des revenus' },
          { fieldId: 'contact.email' },
          { fieldId: 'contact.telephone' },
        ],
      },
      {
        title: 'Connexion au service en ligne',
        fields: [
          { fieldId: 'impots.numeroFiscal', required: true },
          { fieldId: 'impots.referenceAvis', required: true },
        ],
      },
      {
        title: 'Revenus et charges',
        fields: [
          { fieldId: 'emploi.employeur' },
          { fieldId: 'impots.revenusSalaires', required: true, label: 'Salaires — case 1AJ' },
          { fieldId: 'impots.revenusPensions', label: 'Pensions — case 1AS' },
          { fieldId: 'impots.revenusAutres', label: 'Autres revenus' },
          { fieldId: 'impots.chargesDeductibles', label: 'Charges déductibles' },
          { fieldId: 'impots.prelevementSource', label: 'Taux de prélèvement actuel' },
        ],
      },
    ],
    checklist: [
      'Bulletins de salaire de l\'année (contrôle des montants pré-remplis)',
      'Attestations fiscales : dons, garde d\'enfants, frais de garde',
      'Relevé des intérêts bancaires et du PEA',
      'Justificatifs des frais réels si vous les déduisez',
      'Avis de la dernière déclaration (pour la référence d\'avis)',
      'Vérifier que le foyer n\'a pas changé (mariage, naissance, départ)',
    ],
    notes: [
      'Aucune donnée ne quitte votre appareil : cette fiche sert d\'aide-mémoire pour la saisie officielle sur impots.gouv.fr.',
      'Les cases citées correspondent au formulaire 2042 courant ; vérifiez-les sur votre déclaration pré-remplie.',
    ],
  },
  {
    id: 'sante',
    title: 'Fiche santé & urgence',
    subtitle: 'Tout ce qu\'un soignant doit savoir en un coup d\'œil',
    icon: 'heart-half',
    color: '#F87171',
    cta: 'Générer ma fiche santé',
    sections: [
      {
        title: 'Assuré',
        fields: [
          { fieldId: 'civil.prenom', required: true },
          { fieldId: 'civil.nom', required: true },
          { fieldId: 'civil.dateNaissance', required: true },
          { fieldId: 'civil.lieuNaissance' },
          { fieldId: 'sante.numeroSecu', required: true },
        ],
      },
      {
        title: 'Soins',
        fields: [
          { fieldId: 'sante.groupeSanguin' },
          { fieldId: 'sante.medecinTraitant', required: true },
          { fieldId: 'sante.medecinTelephone' },
          { fieldId: 'sante.allergies' },
          { fieldId: 'sante.traitements' },
          { fieldId: 'sante.antecedents' },
        ],
      },
      {
        title: 'Couverture',
        fields: [
          { fieldId: 'mutuelle.organisme' },
          { fieldId: 'mutuelle.numeroContrat' },
          { fieldId: 'mutuelle.telephone' },
        ],
      },
      {
        title: 'En cas d\'urgence',
        fields: [
          { fieldId: 'sante.contactUrgenceNom', required: true },
          { fieldId: 'sante.contactUrgenceTel', required: true },
        ],
      },
    ],
    checklist: [
      'Carte Vitale à jour',
      'Attestation de droits ameli (disponible sur le compte ameli)',
      'Attestation de mutuelle',
      'Ordonnances en cours et cartes de pharmacie',
      'Carnet de vaccination ou vaccination numérique',
    ],
    notes: [
      'À imprimer et glisser dans le portefeuille, la trousse de first aid ou à donner à la personne de confiance.',
      'Ces informations restent localisées ; partagez la fiche uniquement aux professionnels concernés.',
    ],
  },
  {
    id: 'demenagement',
    title: 'Déménagement',
    subtitle: 'Lettre de changement d\'adresse et 14 organismes à prévenir',
    icon: 'car',
    color: '#34D399',
    cta: 'Générer mes courriers de déménagement',
    extraField: { id: 'demenagement.date', label: 'Date du déménagement' },
    sections: [
      {
        title: 'Vous',
        fields: [
          { fieldId: 'civil.prenom', required: true },
          { fieldId: 'civil.nom', required: true },
          { fieldId: 'contact.telephone', required: true },
          { fieldId: 'contact.email' },
        ],
      },
      {
        title: 'Logements',
        fields: [
          { fieldId: 'domicile.adresse', required: true, label: 'Ancienne adresse complète' },
          { fieldId: 'domicile.codePostal', required: true },
          { fieldId: 'domicile.ville', required: true },
          { fieldId: 'demenagement.nouvelleAdresse', required: true, label: 'Nouvelle adresse complète' },
          { fieldId: 'demenagement.nouveauCodePostal', required: true },
          { fieldId: 'demenagement.nouvelleVille', required: true },
          { fieldId: 'demenagement.date', label: 'Date du déménagement' },
        ],
      },
      {
        title: 'À signaler ensuite aux organismes',
        fields: [
          { fieldId: 'impots.numeroFiscal', label: 'Numéro fiscal (impôts)' },
          { fieldId: 'sante.numeroSecu', label: 'Numéro de sécurité sociale (CPAM)' },
          { fieldId: 'mutuelle.organisme', label: 'Mutuelle à prévenir' },
          { fieldId: 'banque.etablissement', label: 'Banque à prévenir' },
          { fieldId: 'vehicule.assurance', label: 'Assurance auto à mettre à jour' },
        ],
      },
    ],
    checklist: [
      'Boîte postale de transfert du courrier auprès de La Poste',
      'Résiliation ou transfert des contrats d\'énergie',
      'Nouveau contrat d\'eau si une autre régie gère le logement',
      'Transfert de la ligne internet et de l\'abonnement mobile',
      'Assurance habitation : nouveau logement couvert dès l\'entrée',
      'Déclaration de changement d\'adresse impôts, CAF, CPAM, retraite',
      'Inscription des enfants à la nouvelle école / crèche',
      'Prévenir la banque, la mutuelle, l\'employeur',
      'Mise à jour carte grise au nom de la nouvelle adresse',
      'Récupération du dépôt de garantie et état des lieux de sortie',
      'Résiliation des abonnements : sport, presse, spectacle…',
      'Ménage et petites réparations avant la sortie',
      'État des lieux de sortie suivi et remise des clés le jour J',
      'Inscription aux listes électorales de la nouvelle commune',
    ],
    notes: [
      'La lettre générée est un modèle générique signé de vous ; adaptez-la avant envoi.',
      'Pour les organismes en ligne (impôts, CAF, ameli), la fiche vous donne les champs exacts à reporter.',
    ],
  },
];

export function getTemplate(id: string): FormTemplate | undefined {
  return FORM_TEMPLATES.find((t) => t.id === id);
}

export type FilledTemplate = {
  template: FormTemplate;
  sections: { title: string; rows: { fieldId: string; label: string; value: string; missing: boolean }[] }[];
  missingFields: string[];
  filledCount: number;
};

export function buildFilledTemplate(
  template: FormTemplate,
  values: Record<string, string>,
): FilledTemplate {
  const missingFields: string[] = [];
  let filledCount = 0;
  const sections = template.sections.map((section) => {
    const rows = section.fields.map((entry) => {
      const field = PROFILE_FIELDS.find((f) => f.id === entry.fieldId);
      const label = entry.label ?? field?.label ?? entry.fieldId;
      const value = values[entry.fieldId] ?? '';
      const missing = entry.required === true && value.length === 0;
      if (missing) {
        missingFields.push(entry.fieldId);
      }
      if (value.length > 0) {
        filledCount += 1;
      }
      return { fieldId: entry.fieldId, label, value, missing };
    });
    return { title: section.title, rows };
  });
  return { template, sections, missingFields, filledCount };
}
