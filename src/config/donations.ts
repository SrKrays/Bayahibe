/**
 * DATOS PARA COLABORAR
 * ------------------------------------------------------------
 * ⚠️ Completar con los datos reales que pase el cliente ANTES de publicar.
 * Mientras un valor diga "A COMPLETAR", el modal lo muestra marcado en amarillo.
 *
 * - `copy: true` agrega un botón "Copiar" al lado del dato.
 * - Se pueden agregar o quitar métodos (transferencia, alias, PayPal, etc.).
 * - Los nombres de los campos se traducen solos si están en src/i18n/translations.ts.
 */
export interface DonationField {
  name: string;
  value: string;
  copy?: boolean;
}

export interface DonationMethod {
  title: string;
  note?: string;
  fields: DonationField[];
}

export const PLACEHOLDER = 'A COMPLETAR';

export const DONATION_METHODS: DonationMethod[] = [
  {
    title: 'Transferencia bancaria',
    note: 'Desde República Dominicana',
    fields: [
      { name: 'Alias', value: PLACEHOLDER, copy: true },
      { name: 'Banco', value: PLACEHOLDER },
      { name: 'Titular', value: PLACEHOLDER },
      { name: 'Número de cuenta', value: PLACEHOLDER, copy: true },
      { name: 'Tipo de cuenta', value: PLACEHOLDER },
      { name: 'RNC / Cédula', value: PLACEHOLDER, copy: true },
    ],
  },
  {
    title: 'Desde el exterior',
    note: 'PayPal u otra plataforma',
    fields: [{ name: 'PayPal', value: PLACEHOLDER, copy: true }],
  },
];

/** Contacto para avisar la donación o donar materiales (WhatsApp con código de país, sin + ni espacios). */
export const DONATION_CONTACT = {
  whatsapp: '', // ej. '18095551234' → si queda vacío, no se muestra el botón
  email: '', // ej. 'hola@bayahibeverde.org'
};
