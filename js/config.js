/**
 * CONFIGURACIÓN DE SF WINES
 * ─────────────────────────────────────────────
 * Editá estos valores antes de publicar el sitio.
 * Ver SETUP.md para instrucciones detalladas.
 */
const CONFIG = {
  // URL del Google Sheet publicado como CSV.
  // Instrucciones en SETUP.md → Paso 1.
  SHEET_URL: 'https://docs.google.com/spreadsheets/d/1onfmg9TaC7T0miHUwdgd__892lrVLrLdu99sPTI8gtw/export?format=csv&gid=1794766170',

  // Número de WhatsApp para consultas (sin +, con código de país)
  WHATSAPP: '5491170847696',

  // URL base del sitio (sin barra al final). Netlify la setea automáticamente
  // como variable de entorno URL, pero también podés hardcodearla aquí.
  SITE_URL: '',

  // Moneda para formatear precios
  MONEDA: 'ARS',
  LOCALE: 'es-AR',
};
