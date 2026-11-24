import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { DEMENAGEMENT_ORGANISMES as ORGANISMES } from '../data/formTemplates';
import type { FilledTemplate } from '../data/formTemplates';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BASE_STYLE = `
  <style>
    body { font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif; margin: 0; color: #16213a; }
    .page { padding: 40px; }
    h1 { font-size: 22px; margin: 0 0 4px; }
    .meta { color: #5a6478; font-size: 12px; margin-bottom: 24px; }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #43506e; border-bottom: 1px solid #d7ddeb; padding-bottom: 6px; margin: 24px 0 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    td { padding: 7px 8px; border-bottom: 1px solid #e7ecf5; vertical-align: top; }
    td.label { color: #5a6478; width: 42%; }
    td.value { font-weight: 600; }
    td.value.missing { color: #b3312f; font-style: italic; font-weight: 500; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
    .badge.ok { background: #e2f7ea; color: #14683b; }
    .badge.missing { background: #fdeaea; color: #b3312f; }
    .checklist li { margin: 5px 0; }
    .organismes li { margin: 5px 0; }
    .note { background: #f2f5fb; border-left: 4px solid #43506e; padding: 10px 14px; font-size: 12px; color: #43506e; border-radius: 6px; margin-top: 24px; }
    .letter { padding: 40px 48px; }
    .letter h2 { border: none; margin-top: 28px; }
    .letter p { line-height: 1.65; font-size: 14px; }
    .signature { margin-top: 40px; }
  </style>
`;

function valuesHtml(filled: FilledTemplate): string {
  return filled.sections
    .map(
      (section) => `
      <h2>${escapeHtml(section.title)}</h2>
      <table>
        ${section.rows
          .map(
            (row) => `
          <tr>
            <td class="label">${escapeHtml(row.label)}</td>
            <td class="value ${row.missing ? 'missing' : ''}">${
              row.missing ? 'à compléter dans Coffre' : escapeHtml(row.value)
            }</td>
          </tr>`,
          )
          .join('')}
      </table>`,
    )
    .join('');
}

function checklistHtml(items: string[]): string {
  return `<h2>À rassembler / à faire</h2><ul class="checklist">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul>`;
}

function documentHtml(filled: FilledTemplate): string {
  const { template, missingFields } = filled;
  return `<!DOCTYPE html>
  <html><head><meta charset="utf-8" />${BASE_STYLE}</head>
  <body><div class="page">
    <h1>Coffre — ${escapeHtml(template.title)}</h1>
    <div class="meta">
      Généré localement le ${new Date().toLocaleString('fr-FR')} ·
      <span class="badge ${missingFields.length === 0 ? 'ok' : 'missing'}">${
        missingFields.length === 0 ? 'complet' : `${missingFields.length} champ(s) à compléter`
      }</span>
    </div>
    ${valuesHtml(filled)}
    ${checklistHtml(template.checklist)}
    ${template.notes.map((note) => `<div class="note">${escapeHtml(note)}</div>`).join('')}
  </div></body></html>`;
}

function demenagementLetterHtml(filled: FilledTemplate, get: (id: string) => string): string {
  const fullName = `${get('civil.prenom')} ${get('civil.nom')}`.trim();
  const oldAddress = `${get('domicile.adresse')} ${get('domicile.codePostal')} ${get('domicile.ville')}`
    .replace(/\s+/g, ' ')
    .trim();
  const newAddress = `${get('demenagement.nouvelleAdresse')} ${get('demenagement.nouveauCodePostal')} ${get(
    'demenagement.nouvelleVille',
  )}`
    .replace(/\s+/g, ' ')
    .trim();
  const moveDate = get('demenagement.date');
  const today = new Date().toLocaleDateString('fr-FR');
  return `<!DOCTYPE html>
  <html><head><meta charset="utf-8" />${BASE_STYLE}</head>
  <body><div class="letter">
    <p style="text-align: right;">${escapeHtml(newAddress || 'Nouvelle adresse à compléter')}<br/>${escapeHtml(today)}</p>
    <h1>Objet : changement d'adresse${moveDate ? ` à compter du ${escapeHtml(moveDate)}` : ''}</h1>
    <p>Madame, Monsieur,</p>
    <p>Je vous informe de mon changement d'adresse${moveDate ? ` intervenu(e) le ${escapeHtml(moveDate)}` : ''}.</p>
    <table>
      <tr><td class="label">Ancienne adresse</td><td class="value">${escapeHtml(oldAddress) || 'à compléter'}</td></tr>
      <tr><td class="label">Nouvelle adresse</td><td class="value">${escapeHtml(newAddress) || 'à compléter'}</td></tr>
      <tr><td class="label">Titulaire</td><td class="value">${escapeHtml(fullName) || 'à compléter'}</td></tr>
      <tr><td class="label">Téléphone</td><td class="value">${escapeHtml(get('contact.telephone'))}</td></tr>
      <tr><td class="label">E-mail</td><td class="value">${escapeHtml(get('contact.email'))}</td></tr>
    </table>
    <p>Je vous remercie de bien vouloir mettre à jour mon dossier et de m'adresser dorénavant toute correspondance à ma nouvelle adresse.</p>
    <p>Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>
    <div class="signature"><p>${escapeHtml(fullName)}</p></div>
  </div></body></html>`;
}

function organismesHtml(): string {
  return `<h2>Organismes et services à prévenir</h2><ol class="organismes">${ORGANISMES.map(
    (organisme) => `<li>${escapeHtml(organisme)}</li>`,
  ).join('')}</ol>`;
}

export type PdfExportResult = { uri: string };

export async function exportFilledPdf(filled: FilledTemplate): Promise<PdfExportResult> {
  const result = await Print.printToFileAsync({ html: documentHtml(filled) });
  return { uri: result.uri };
}

export async function exportDemenagementPdf(
  filled: FilledTemplate,
  get: (id: string) => string,
  includeLetter: boolean,
): Promise<PdfExportResult> {
  const html = `${documentHtml(filled)}${includeLetter ? demenagementLetterHtml(filled, get) : ''}${organismesHtml()}`;
  const result = await Print.printToFileAsync({ html });
  return { uri: result.uri };
}

export async function sharePdf(uri: string, title: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: title,
      UTI: 'com.adobe.pdf',
    });
  }
}
