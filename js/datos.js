/**
 * MÓDULO DE DATOS — Google Sheets CSV
 * Columnas esperadas en el Sheet:
 *   id | nombre | bodega | varietal | descripcion |
 *   precio_unitario | precio_caja | botellas_caja |
 *   imagen_url | categoria | activo
 */

/**
 * Parsea una línea CSV respetando comillas y comas dentro de campos.
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // comilla doble escapada dentro de campo
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parsea el texto CSV completo y retorna array de objetos.
 */
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));

  return lines
    .slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = parseCSVLine(line);
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i] !== undefined ? values[i] : '';
        return obj;
      }, {});
    });
}

/**
 * Formatea un número como precio en pesos argentinos.
 */
function formatPrecio(valor) {
  const n = parseFloat(valor);
  if (isNaN(n)) return '';
  return n.toLocaleString(CONFIG.LOCALE, {
    style: 'currency',
    currency: CONFIG.MONEDA,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Descarga y parsea el Sheet.
 * Retorna un array de productos activos ordenados por bodega.
 */
async function fetchProductos() {
  const url = CONFIG.SHEET_URL;

  if (!url || url.includes('TU_SHEET_ID_AQUI')) {
    console.warn('[SF Wines] SHEET_URL no configurado. Usando datos de ejemplo.');
    return getDatosEjemplo();
  }

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    const rows = parseCSV(text);

    return rows
      .filter(r => r.activo?.toLowerCase() !== 'false' && r.activo !== '0' && r.nombre?.trim())
      .map((r, i) => ({
        id: r.id || String(i + 1),
        nombre: r.nombre || '',
        bodega: r.bodega || '',
        varietal: r.varietal || '',
        descripcion: r.descripcion || '',
        precioUnitario: parseFloat(r.precio_unitario) || 0,
        precioCaja: parseFloat(r.precio_caja) || 0,
        botellasXCaja: parseInt(r.botellas_caja) || 0,
        imagenUrl: r.imagen_url || '',
        categoria: r.categoria || '',
      }))
      .sort((a, b) => a.bodega.localeCompare(b.bodega));

  } catch (err) {
    console.error('[SF Wines] Error al cargar el Sheet:', err);
    return getDatosEjemplo();
  }
}

/**
 * Datos de ejemplo para desarrollo/preview sin Sheet configurado.
 */
function getDatosEjemplo() {
  return [
    {
      id: '1', nombre: 'Gran Enemigo Corte', bodega: 'El Enemigo',
      varietal: 'Cabernet Franc', descripcion: 'Vino de alta gama de Adrianna Vineyard, Gualtallary.',
      precioUnitario: 12000, precioCaja: 120000, botellasXCaja: 6,
      imagenUrl: '', categoria: 'Premium',
    },
    {
      id: '2', nombre: 'Mara Merlot', bodega: 'Bodegas Mara de Uco',
      varietal: 'Merlot', descripcion: 'Elegante merlot del Valle de Uco con notas de ciruela y especias.',
      precioUnitario: 8500, precioCaja: 85000, botellasXCaja: 6,
      imagenUrl: '', categoria: 'Selección',
    },
    {
      id: '3', nombre: 'Zaha Malbec', bodega: 'Zaha',
      varietal: 'Malbec', descripcion: 'Malbec de alta expresión, con cuerpo y profundidad.',
      precioUnitario: 9500, precioCaja: 95000, botellasXCaja: 6,
      imagenUrl: '', categoria: 'Premium',
    },
  ];
}
