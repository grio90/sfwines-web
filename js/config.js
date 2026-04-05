/**
 * CONFIGURACIÓN DE SF WINES
 * ─────────────────────────────────────────────
 * Editá estos valores antes de publicar el sitio.
 * Ver SETUP.md para instrucciones detalladas.
 */
const CONFIG = {
  // Ruta al CSV de productos (relativa al sitio).
  // Para actualizar: editar productos.csv y hacer push a GitHub.
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/1Ok1TOO0LnAtmDKL-B_UtofNtQYwAAw5SJexSpivDkzk/export?format=csv&gid=1213335531',

  // Número de WhatsApp para consultas (sin +, con código de país)
  WHATSAPP: '5491170847696',

  // URL base del sitio (sin barra al final). Netlify la setea automáticamente
  // como variable de entorno URL, pero también podés hardcodearla aquí.
  SITE_URL: '',

  // Moneda para formatear precios
  MONEDA: 'ARS',
  LOCALE: 'es-AR',
};
