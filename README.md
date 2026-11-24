# Coffre

Application **100 % locale** (iOS, Android **et site web installable**) qui
centralise vos préférences, vos documents administratifs et vos habitudes,
chiffrés sur votre appareil — et qui remplit vos formulaires complexes
(déclaration de revenus, fiche santé, déménagement) en un clic, sans
aucun envoi cloud.

**Version web** : le site exporté (GitHub Pages) fonctionne avec les mêmes
mécanismes — chiffrement identique, stockage IndexedDB d'origine (le coffre
sécurisé est propriétaire du navigateur), aucun appel réseau avec vos
données. Sur mobile natif, la clé est en outre protégée par Keychain /
Keystore et la biométrie.

## Garanties de confidentialité

- **Aucun backend, aucun compte, aucune télémétrie** : le code ne contient
  aucune requête réseau portant sur vos données.
- **Chiffrement XChaCha20-Poly1305** (bibliothèque auditée `@noble/ciphers`)
  pour chaque champ, document et habitude avant écriture.
- **Clé maîtresse 256 bits** générée aléatoirement puis stockée uniquement
  dans le coffre sécurisé du système (iOS Keychain / Android Keystore),
  jamais exportée ni synchronisée.
- **Déverrouillage biométrique** (Face ID / empreinte) via
  `expo-local-authentication` avant tout accès aux données.
- **Documents chiffrés au repos** : PDF et images sont chiffrés en binaire
  (`<uuid>.bin`) dans le dossier privé de l'app ; l'aperçu déchiffre à la
  volée vers le cache système.
- **Effacement total** depuis les réglages : clé + base + fichiers chiffrés.

## Fonctionnalités

| Onglet | Ce qu'il fait |
|---|---|
| Accueil | État de sécurité, statistiques du coffre, raccourcis de remplissage |
| Profil | ~50 champs (état civil, domicile, impôts, santé, banque…) organisés en catégories réductibles, chaque saisie est chiffrée à l'enregistrement |
| Documents | Import (PDF / images), catégorisation, aperçu déchiffré, suppression sécurisée |
| Formulaires | 3 modèles réalistes : **Déclaration de revenus**, **Fiche santé & urgence**, **Déménagement** (lettre de changement d'adresse + organismes à prévenir). Remplissage automatique depuis le profil, PDF exportable via le partage natif |
| Habitudes | Suivi quotidien chiffré, séries (streaks), objectif hebdomadaire |
| Réglages | Verrouillage instantané, informations de sécurité, effacement total |

## Architecture

```
src/
  app/                 Routes Expo Router (écrans uniquement)
    (tabs)/            Navigation par onglets
    formulaires/[id]   Exécution d'un formulaire (pile racine)
  components/          UI partagée + écran de verrouillage
  data/                Régistre des champs de profil et modèles de formulaires
  lib/                 crypto.ts (chiffrement), db.ts (SQLite), pdf.ts (export)
  state/               VaultProvider (clé, état déverrouillé, actions)
```

- **Navigation** : Expo Router (routes dans `src/app/`).
- **Stockage natif** : `expo-sqlite` (base `coffre.db`), une ligne chiffrée par donnée.
- **Stockage web** : IndexedDB (`src/lib/db.web.ts`, `blobStore.web.ts`, `webIdb.ts`) via extensions de plateforme Metro.
- **Fichiers natifs** : `expo-file-system` (API `File`/`Directory`), dossier `coffre/`.
- **PDF** : `expo-print` + `expo-sharing` (génération locale, partage à votre main).

## Commandes

```bash
npm install            # installation
npx expo start         # développement (Expo Go / build dev)
npm run test           # vérification des types (tsc --noEmit)
npm run lint           # ESLint (eslint-config-expo)
npx expo export --platform android   # vérification du bundle Hermes
```

> Après installation, les bibliothèques à code natif (biométrie, Keychain/Keystore)
> nécessitent un build de développement : `npx expo run:android`/`run:ios`
> ou `eas build --profile development` — l'app n'est pas limitée à Expo Go.

## Mise en ligne (GitHub Pages)

```bash
npx expo export --platform web   # génère dist/
touch dist/.nojekyll
```

Publiez ensuite le contenu de `dist/` sur la branche `gh-pages`. Dans les
réglages du dépôt : **Settings → Pages → Source : « Deploy from a branch » →
`gh-pages` / (root)**. Le dépôt doit être **public** pour un site gratuit.
Le site est alors servi sur `https://<compte>.github.io/coffre-fort-perso/`.

## Modèles de formulaires

Chaque modèle déclare ses sections/champs, une checklist de pièces et des
notes. `buildFilledTemplate()` croise le modèle avec les valeurs chiffrées
déverrouillées en mémoire ; le bandeau indique champs prêts / manquants.

Ajouter un modèle = ajouter un objet `FormTemplate` dans
`src/data/formTemplates.ts` (aucun autre changement requis).
