export type FieldType = 'text' | 'multiline' | 'date' | 'number' | 'phone' | 'email';

export type ProfileField = {
  id: string;
  label: string;
  category: string;
  type: FieldType;
  placeholder: string;
  secure?: boolean;
};

export const FIELD_CATEGORIES = [
  'État civil',
  'Coordonnées',
  'Domicile',
  'Emploi',
  'Impôts',
  'Santé',
  'Mutuelle',
  'Banque',
  'Véhicule',
  'Déménagement',
] as const;

export const PROFILE_FIELDS: ProfileField[] = [
  { id: 'civil.prenom', label: 'Prénom(s)', category: 'État civil', type: 'text', placeholder: 'Jeanne' },
  { id: 'civil.nom', label: 'Nom de famille', category: 'État civil', type: 'text', placeholder: 'Dupont' },
  { id: 'civil.nomNaissance', label: 'Nom de naissance', category: 'État civil', type: 'text', placeholder: 'Martin' },
  { id: 'civil.dateNaissance', label: 'Date de naissance', category: 'État civil', type: 'date', placeholder: '14/03/1990' },
  { id: 'civil.lieuNaissance', label: 'Lieu de naissance', category: 'État civil', type: 'text', placeholder: 'Lyon (69)' },
  { id: 'civil.paysNaissance', label: 'Pays de naissance', category: 'État civil', type: 'text', placeholder: 'France' },
  { id: 'civil.nationalite', label: 'Nationalité', category: 'État civil', type: 'text', placeholder: 'Française' },
  { id: 'civil.situationFamiliale', label: 'Situation familiale', category: 'État civil', type: 'text', placeholder: 'Mariée, pacsée, célibataire…' },
  { id: 'civil.enfantsACharge', label: 'Enfants à charge', category: 'État civil', type: 'number', placeholder: '0' },

  { id: 'contact.telephone', label: 'Téléphone mobile', category: 'Coordonnées', type: 'phone', placeholder: '06 12 34 56 78' },
  { id: 'contact.telephoneFixe', label: 'Téléphone fixe', category: 'Coordonnées', type: 'phone', placeholder: '01 23 45 67 89' },
  { id: 'contact.email', label: 'E-mail', category: 'Coordonnées', type: 'email', placeholder: 'jeanne.dupont@exemple.fr' },

  { id: 'domicile.adresse', label: 'Adresse actuelle', category: 'Domicile', type: 'multiline', placeholder: '12 rue des Lilas' },
  { id: 'domicile.codePostal', label: 'Code postal actuel', category: 'Domicile', type: 'text', placeholder: '75011' },
  { id: 'domicile.ville', label: 'Ville actuelle', category: 'Domicile', type: 'text', placeholder: 'Paris' },
  { id: 'domicile.dateArrivee', label: 'Date d\'arrivée au logement', category: 'Domicile', type: 'date', placeholder: '01/09/2021' },
  { id: 'domicile.statutOccupation', label: 'Statut d\'occupation', category: 'Domicile', type: 'text', placeholder: 'Locataire, propriétaire…' },
  { id: 'domicile.loyer', label: 'Montant du loyer (€/mois)', category: 'Domicile', type: 'number', placeholder: '850' },

  { id: 'emploi.employeur', label: 'Employeur', category: 'Emploi', type: 'text', placeholder: 'ACME Industrie SAS' },
  { id: 'emploi.profession', label: 'Profession', category: 'Emploi', type: 'text', placeholder: 'Infirmière' },
  { id: 'emploi.typeContrat', label: 'Type de contrat', category: 'Emploi', type: 'text', placeholder: 'CDI' },
  { id: 'emploi.dateEmbauche', label: 'Date d\'embauche', category: 'Emploi', type: 'date', placeholder: '03/01/2019' },
  { id: 'emploi.matricule', label: 'Matricule salarié', category: 'Emploi', type: 'text', placeholder: '008421' },

  { id: 'impots.numeroFiscal', label: 'Numéro fiscal', category: 'Impôts', type: 'text', placeholder: '13 30 90 123 456', secure: true },
  { id: 'impots.referenceAvis', label: 'Référence du dernier avis', category: 'Impôts', type: 'text', placeholder: '2019COF123456', secure: true },
  { id: 'impots.revenusSalaires', label: 'Salaires déclarés (€)', category: 'Impôts', type: 'number', placeholder: '42000' },
  { id: 'impots.revenusPensions', label: 'Pensions retraites (€)', category: 'Impôts', type: 'number', placeholder: '0' },
  { id: 'impots.revenusAutres', label: 'Autres revenus (€)', category: 'Impôts', type: 'number', placeholder: '0' },
  { id: 'impots.chargesDeductibles', label: 'Charges déductibles (€)', category: 'Impôts', type: 'number', placeholder: '1200' },
  { id: 'impots.prelevementSource', label: 'Taux de prélèvement à la source', category: 'Impôts', type: 'text', placeholder: '7,2 %' },

  { id: 'sante.numeroSecu', label: 'Numéro de sécurité sociale', category: 'Santé', type: 'text', placeholder: '1 90 03 69 123 456 78', secure: true },
  { id: 'sante.groupeSanguin', label: 'Groupe sanguin', category: 'Santé', type: 'text', placeholder: 'A+' },
  { id: 'sante.medecinTraitant', label: 'Médecin traitant', category: 'Santé', type: 'text', placeholder: 'Dr Camille Laurent' },
  { id: 'sante.medecinTelephone', label: 'Téléphone du médecin', category: 'Santé', type: 'phone', placeholder: '05 61 23 45 67' },
  { id: 'sante.allergies', label: 'Allergies', category: 'Santé', type: 'multiline', placeholder: 'Pénicilline, arachides…' },
  { id: 'sante.traitements', label: 'Traitements en cours', category: 'Santé', type: 'multiline', placeholder: 'Levothyrox 75 µg/jour' },
  { id: 'sante.antecedents', label: 'Antécédents importants', category: 'Santé', type: 'multiline', placeholder: 'Asthme, chirurgie 2022…' },
  { id: 'sante.contactUrgenceNom', label: 'Contact d\'urgence — nom', category: 'Santé', type: 'text', placeholder: 'Marc Dupont' },
  { id: 'sante.contactUrgenceTel', label: 'Contact d\'urgence — téléphone', category: 'Santé', type: 'phone', placeholder: '06 98 76 54 32' },

  { id: 'mutuelle.organisme', label: 'Organisme de mutuelle', category: 'Mutuelle', type: 'text', placeholder: 'Harmonie Mutuelle' },
  { id: 'mutuelle.numeroContrat', label: 'Numéro de contrat', category: 'Mutuelle', type: 'text', placeholder: '9052834120', secure: true },
  { id: 'mutuelle.telephone', label: 'Téléphone de la mutuelle', category: 'Mutuelle', type: 'phone', placeholder: '01 45 67 89 01' },

  { id: 'banque.etablissement', label: 'Banque', category: 'Banque', type: 'text', placeholder: 'Banque Postale' },
  { id: 'banque.iban', label: 'IBAN', category: 'Banque', type: 'text', placeholder: 'FR76 3000 4008 2800 0123 4567 890', secure: true },
  { id: 'banque.bic', label: 'BIC', category: 'Banque', type: 'text', placeholder: 'BNPAFRPPXXX' },

  { id: 'vehicule.marque', label: 'Marque et modèle', category: 'Véhicule', type: 'text', placeholder: 'Peugeot 208' },
  { id: 'vehicule.plaque', label: 'Plaque d\'immatriculation', category: 'Véhicule', type: 'text', placeholder: 'AB-123-CD', secure: true },
  { id: 'vehicule.assurance', label: 'Assurance auto', category: 'Véhicule', type: 'text', placeholder: 'MAIF — contrat 452CEF' },

  { id: 'demenagement.nouvelleAdresse', label: 'Nouvelle adresse', category: 'Déménagement', type: 'multiline', placeholder: '5 avenue Victor Hugo' },
  { id: 'demenagement.nouveauCodePostal', label: 'Nouveau code postal', category: 'Déménagement', type: 'text', placeholder: '31400' },
  { id: 'demenagement.nouvelleVille', label: 'Nouvelle ville', category: 'Déménagement', type: 'text', placeholder: 'Toulouse' },
  { id: 'demenagement.date', label: 'Date du déménagement', category: 'Déménagement', type: 'date', placeholder: '15/07/2026' },
];

const FIELD_INDEX = new Map(PROFILE_FIELDS.map((field) => [field.id, field]));

export function getField(id: string): ProfileField | undefined {
  return FIELD_INDEX.get(id);
}

export function fieldsByCategory(): { category: string; fields: ProfileField[] }[] {
  return FIELD_CATEGORIES.map((category) => ({
    category,
    fields: PROFILE_FIELDS.filter((field) => field.category === category),
  }));
}
