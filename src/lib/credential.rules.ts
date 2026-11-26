export type CredentialKind = 'pin' | 'password';

export type CredentialRecord = {
  kind: CredentialKind;
  /** Sel aléatoire en base64. */
  salt: string;
  /** Empreinte du secret : jamais le secret lui-même. */
  hash: string;
  rounds: number;
  createdAt: number;
};

export function validateCredential(kind: CredentialKind, secret: string): string | null {
  if (kind === 'pin') {
    if (!/^\d+$/.test(secret)) {
      return 'Le code PIN ne doit contenir que des chiffres.';
    }
    if (secret.length !== 4 && secret.length !== 6) {
      return 'Le code PIN doit contenir 4 ou 6 chiffres.';
    }
    if (/^(\d)\1+$/.test(secret)) {
      return 'Ce code est trop prévisible : évitez les chiffres tous identiques.';
    }
    if (secret === '1234' || secret === '4321' || secret === '123456' || secret === '654321') {
      return 'Ce code est trop prévisible : évitez les suites.';
    }
    return null;
  }
  if (secret.length < 8) {
    return 'Le mot de passe maître doit contenir au moins 8 caractères.';
  }
  if (
    secret.toLowerCase() === 'motdepasse' ||
    secret === 'azertyuiop' ||
    secret === 'qwertyuiop'
  ) {
    return 'Ce mot de passe est trop courant.';
  }
  return null;
}

export function credentialLabel(kind: CredentialKind): string {
  return kind === 'pin' ? 'Code PIN de secours' : 'Mot de passe maître de secours';
}
