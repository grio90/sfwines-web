/**
 * MÓDULO CARRITO
 * Estado persistido en localStorage.
 * Expone: Carrito.agregar / quitar / actualizar / vaciar / items / total
 */

const Carrito = (() => {
  const STORAGE_KEY = 'sfwines_carrito';
  let items = [];

  // ── Persistencia ──────────────────────────────
  function cargar() {
    try {
      items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      items = [];
    }
  }

  function guardar() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    _emit();
  }

  // ── API pública ───────────────────────────────
  function agregar(producto, cantidad = 1) {
    const existente = items.find(i => i.id === producto.id);
    if (existente) {
      existente.cantidad += cantidad;
    } else {
      items.push({ ...producto, cantidad });
    }
    guardar();
  }

  function quitar(id) {
    items = items.filter(i => i.id !== id);
    guardar();
  }

  function actualizar(id, cantidad) {
    if (cantidad <= 0) { quitar(id); return; }
    const item = items.find(i => i.id === id);
    if (item) { item.cantidad = cantidad; guardar(); }
  }

  function vaciar() {
    items = [];
    guardar();
  }

  function getItems() { return [...items]; }

  function total() {
    return items.reduce((acc, i) => acc + i.precioUnitario * i.cantidad, 0);
  }

  function totalItems() {
    return items.reduce((acc, i) => acc + i.cantidad, 0);
  }

  // ── Evento personalizado ──────────────────────
  function _emit() {
    document.dispatchEvent(new CustomEvent('carritoActualizado', {
      detail: { items: getItems(), total: total(), totalItems: totalItems() }
    }));
  }

  // Init
  cargar();

  return { agregar, quitar, actualizar, vaciar, getItems, total, totalItems };
})();


// ── UI DEL CARRITO ────────────────────────────────────────────────────────────

(function initCartUI() {
  const cartBtn    = document.getElementById('cartBtn');
  const cartBadge  = document.getElementById('cartBadge');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose  = document.getElementById('cartClose');
  const cartItems  = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal  = document.getElementById('cartTotal');

  function abrirCarrito() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function cerrarCarrito() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartBtn.addEventListener('click', abrirCarrito);
  cartClose.addEventListener('click', cerrarCarrito);
  cartOverlay.addEventListener('click', cerrarCarrito);

  function renderCarrito() {
    const items = Carrito.getItems();

    // Badge
    const total = Carrito.totalItems();
    cartBadge.textContent = total;
    cartBadge.classList.toggle('visible', total > 0);

    // Items vacíos
    if (items.length === 0) {
      cartItems.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
      cartFooter.style.display = 'none';
      return;
    }

    cartFooter.style.display = 'block';
    cartTotal.textContent = formatPrecio(Carrito.total());

    cartItems.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        ${item.imagenUrl
          ? `<img class="cart-item-img" src="${item.imagenUrl}" alt="${item.nombre}" loading="lazy" />`
          : `<div class="cart-item-img" style="background:#1a1a1a;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#444;font-size:24px;">🍷</div>`
        }
        <div class="cart-item-info">
          <p class="cart-item-nombre">${item.nombre}</p>
          <p class="cart-item-bodega">${item.bodega}</p>
          <div class="cart-item-controls">
            <div class="qty-mini">
              <button class="qty-dec" aria-label="Menos">−</button>
              <span>${item.cantidad}</span>
              <button class="qty-inc" aria-label="Más">+</button>
            </div>
            <button class="cart-item-remove">Eliminar</button>
          </div>
        </div>
        <span class="cart-item-precio">${formatPrecio(item.precioUnitario * item.cantidad)}</span>
      </div>
    `).join('');

    // Event delegation para controles
    cartItems.querySelectorAll('.cart-item').forEach(el => {
      const id = el.dataset.id;
      const item = items.find(i => i.id === id);
      el.querySelector('.qty-dec').addEventListener('click', () =>
        Carrito.actualizar(id, item.cantidad - 1));
      el.querySelector('.qty-inc').addEventListener('click', () =>
        Carrito.actualizar(id, item.cantidad + 1));
      el.querySelector('.cart-item-remove').addEventListener('click', () =>
        Carrito.quitar(id));
    });
  }

  document.addEventListener('carritoActualizado', renderCarrito);

  // Render inicial
  renderCarrito();
})();
