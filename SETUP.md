# SF Wines — Guía de configuración

## Paso 1 — Google Sheets (catálogo de productos)

1. Crear un nuevo Google Sheet con estas columnas exactas en la fila 1:

   | id | nombre | bodega | varietal | descripcion | precio_unitario | precio_caja | botellas_caja | imagen_url | categoria | activo |

2. Cargar los productos (una fila por producto). Ejemplos:
   - `activo`: TRUE o FALSE (FALSE oculta el producto del sitio)
   - `precio_unitario`: número sin símbolo, ej: `8500`
   - `precio_caja`: número sin símbolo, ej: `85000` (dejarlo vacío si no aplica)
   - `imagen_url`: URL pública de la foto del producto (ver sección Imágenes)

3. Compartir el Sheet:
   - Archivo → Compartir → Cualquier persona con el enlace → Lector

4. Obtener el ID del Sheet de la URL:
   ```
   https://docs.google.com/spreadsheets/d/  ESTE_ES_EL_ID  /edit
   ```

5. Abrir `js/config.js` y reemplazar `TU_SHEET_ID_AQUI` con ese ID.

---

## Paso 2 — Imágenes de productos

Las imágenes deben ser URLs públicas. Opciones recomendadas:

### Opción A — GitHub (gratis, recomendado)
1. Crear un repositorio GitHub (puede ser el mismo del sitio)
2. Subir las imágenes a la carpeta `/imagenes/`
3. La URL de cada imagen será:
   ```
   https://raw.githubusercontent.com/TU_USUARIO/TU_REPO/main/imagenes/NOMBRE_ARCHIVO.jpg
   ```

### Opción B — Google Drive (más simple)
1. Subir la imagen a Google Drive
2. Compartirla como "Cualquier persona con el enlace"
3. Transformar la URL así:
   - URL original: `https://drive.google.com/file/d/FILE_ID/view`
   - URL para el Sheet: `https://drive.google.com/uc?export=view&id=FILE_ID`

---

## Paso 3 — Publicar en Netlify

1. Subir la carpeta `sfwines-web` a un repositorio GitHub
2. Entrar a [netlify.com](https://netlify.com) → New site from Git
3. Conectar el repositorio
4. Deploy settings ya están configurados en `netlify.toml`
5. Hacer clic en "Deploy site"

---

## Paso 4 — Configurar MercadoPago

1. Entrar a [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers/es/docs)
2. Ir a **Tus integraciones** → Tu aplicación → **Credenciales de producción**
3. Copiar el **Access Token** de producción

4. En Netlify → Site settings → **Environment variables** → Add variable:
   ```
   MP_ACCESS_TOKEN = APP_USR-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx
   ```

5. Hacer un nuevo deploy (o Trigger deploy) para que tome la variable.

> ⚠️ **NUNCA** pongas el Access Token en el código. Solo en variables de entorno de Netlify.

---

## Paso 5 — Dominio propio (sfwines.com.ar)

1. En Netlify → Domain settings → Add custom domain
2. Escribir `sfwines.com.ar`
3. Netlify te dará los DNS servers o registros CNAME/A
4. Actualizar los DNS en el registrador del dominio (.com.ar → NIC Argentina)
5. Netlify emite el SSL automáticamente (puede tardar hasta 24hs en propagar)

---

## Actualizar productos / precios

Solo editá el Google Sheet. Los cambios se reflejan en el sitio en ~1 minuto (sin redesploy).

## Actualizar imágenes

1. Subir la nueva imagen (mismo nombre o nuevo)
2. Actualizar la celda `imagen_url` en el Sheet con la nueva URL
3. Listo — sin redesploy

---

## Estructura de archivos

```
sfwines-web/
├── index.html              → Página principal
├── success.html            → Pago exitoso
├── failure.html            → Pago fallido/cancelado
├── netlify.toml            → Configuración Netlify
├── SETUP.md                → Esta guía
├── css/
│   └── style.css           → Todos los estilos
├── js/
│   ├── config.js           → ← EDITAR: URL del Sheet
│   ├── datos.js            → Fetch y parseo del CSV
│   ├── carrito.js          → Lógica y UI del carrito
│   ├── productos.js        → Grid, filtros y modal
│   ├── checkout.js         → Integración MercadoPago
│   └── app.js              → Inicialización
└── netlify/
    └── functions/
        └── crear-preferencia.js  → Serverless function MP
```
