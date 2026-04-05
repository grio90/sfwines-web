/**
 * NETLIFY FUNCTION — Crear preferencia de MercadoPago
 *
 * Variables de entorno requeridas en Netlify:
 *   MP_ACCESS_TOKEN  →  tu Access Token de producción (o test) de MP
 *   SITE_URL         →  URL del sitio, ej: https://sfwines.com.ar
 *                       (Netlify la provee automáticamente como URL)
 */

const https = require('https');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('[MP] MP_ACCESS_TOKEN no configurado');
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Configuración de pago incompleta. Contactar al administrador.' })
    };
  }

  let items;
  try {
    ({ items } = JSON.parse(event.body));
    if (!Array.isArray(items) || items.length === 0) throw new Error('items vacíos');
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Payload inválido.' }) };
  }

  const siteUrl = process.env.URL || process.env.SITE_URL || 'https://sfwines.com.ar';

  const preferenceBody = {
    items: items.map(item => ({
      title: String(item.nombre).substring(0, 256),
      quantity: Math.max(1, parseInt(item.cantidad) || 1),
      unit_price: parseFloat(item.precio),
      currency_id: 'ARS',
    })),
    back_urls: {
      success: `${siteUrl}/success.html`,
      failure: `${siteUrl}/failure.html`,
      pending: `${siteUrl}/failure.html`,
    },
    auto_return: 'approved',
    statement_descriptor: 'SF WINES',
    notification_url: `${siteUrl}/.netlify/functions/mp-webhook`,
  };

  try {
    const result = await mpPost('/checkout/preferences', preferenceBody, accessToken);
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ init_point: result.init_point }),
    };
  } catch (err) {
    console.error('[MP] Error al crear preferencia:', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'No se pudo crear el pago. Intentá de nuevo.' }),
    };
  }
};

/**
 * POST a la API de MercadoPago usando https nativo (sin dependencias).
 */
function mpPost(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'api.mercadopago.com',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data),
        'X-Idempotency-Key': `sfwines-${Date.now()}`,
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.message || `HTTP ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error('Respuesta inválida de MP'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
