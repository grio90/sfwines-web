/**
 * MÓDULO PRODUCTOS
 * Renderiza el grid, maneja filtros y el modal de detalle.
 */

let _todosLosProductos = [];
let _productoActualModal = null;
let _cantidadModal = 1;

// ── RENDER GRID ───────────────────────────────────────────────────────────────

function renderGrid(productos) {
  const grid = document.getElementById('productosGrid');
  const noRes = document.getElementById('noResultados');
  const resLabel = document.getElementById('filtrosResultado');

  if (productos.length === 0) {
    grid.innerHTML = '';
    noRes.style.display = 'block';
    resLabel.textContent = '';
    resLabel.classList.remove('visible');
    return;
  }

  noRes.style.display = 'none';

  // Contador de resultados si hay filtros activos
  if (productos.length < _todosLosProductos.length) {
    resLabel.textContent = `Mostrando ${productos.length} de ${_todosLosProductos.length} productos`;
    resLabel.classList.add('visible');
  } else {
    resLabel.classList.remove('visible');
  }

  grid.innerHTML = productos.map(p => `
    <article class="producto-card" data-id="${p.id}" role="button" tabindex="0" aria-label="${p.nombre}">
      <div class="card-img-wrap">
        ${p.imagenUrl
          ? `<img src="${p.imagenUrl}" alt="${p.nombre}" loading="lazy" />`
          : `<div class="card-img-placeholder">🍷</div>`
        }
      </div>
      <div class="card-body">
        <p class="card-bodega">${p.bodega}</p>
        <h3 class="card-nombre">${p.nombre}</h3>
        <p class="card-varietal">${p.varietal}</p>
        <div class="card-footer">
          <div>
            <p class="card-precio">${formatPrecio(p.precioUnitario)}</p>
            ${p.precioCaja ? `<p class="card-precio-caja">Caja x${p.botellasXCaja}: ${formatPrecio(p.precioCaja)}</p>` : ''}
          </div>
          <button class="card-add-btn" data-id="${p.id}" aria-label="Agregar ${p.nombre} al carrito">+</button>
        </div>
      </div>
    </article>
  `).join('');

  // Click en card → abrir modal
  grid.querySelectorAll('.producto-card').forEach(el => {
    const id = el.dataset.id;
    el.addEventListener('click', (e) => {
      if (e.target.closest('.card-add-btn')) return; // no abrir modal si clickeó el +
      const prod = _todosLosProductos.find(p => p.id === id);
      if (prod) abrirModal(prod);
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') el.click();
    });
  });

  // Click en botón + (agregar directo sin modal)
  grid.querySelectorAll('.card-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const prod = _todosLosProductos.find(p => p.id === btn.dataset.id);
      if (prod) {
        Carrito.agregar(prod, 1);
        mostrarToast(`"${prod.nombre}" agregado al carrito`);
        // Animación del botón
        btn.textContent = '✓';
        btn.style.background = 'var(--success)';
        btn.style.color = '#000';
        setTimeout(() => {
          btn.textContent = '+';
          btn.style.background = '';
          btn.style.color = '';
        }, 1200);
      }
    });
  });
}

// ── FILTROS ───────────────────────────────────────────────────────────────────

function poblarFiltros(productos) {
  const bodegaSelect   = document.getElementById('filtroBodega');
  const varietalSelect = document.getElementById('filtroVarietal');
  const categoriaSelect = document.getElementById('filtroCategoria');

  const bodegas    = [...new Set(productos.map(p => p.bodega).filter(Boolean))].sort();
  const varietales = [...new Set(productos.map(p => p.varietal).filter(Boolean))].sort();
  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))].sort();

  bodegas.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b; opt.textContent = b;
    bodegaSelect.appendChild(opt);
  });
  varietales.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = v;
    varietalSelect.appendChild(opt);
  });
  categorias.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    categoriaSelect.appendChild(opt);
  });
}

function aplicarFiltros() {
  const busqueda  = document.getElementById('busqueda').value.toLowerCase().trim();
  const bodega    = document.getElementById('filtroBodega').value;
  const varietal  = document.getElementById('filtroVarietal').value;
  const categoria = document.getElementById('filtroCategoria').value;
  const btnLimpiar = document.getElementById('btnLimpiar');

  const hayFiltros = busqueda || bodega || varietal || categoria;
  btnLimpiar.style.display = hayFiltros ? 'block' : 'none';

  const filtrados = _todosLosProductos.filter(p => {
    const matchBusqueda = !busqueda || [p.nombre, p.bodega, p.varietal, p.descripcion]
      .some(campo => campo.toLowerCase().includes(busqueda));
    const matchBodega    = !bodega    || p.bodega === bodega;
    const matchVarietal  = !varietal  || p.varietal === varietal;
    const matchCategoria = !categoria || p.categoria === categoria;
    return matchBusqueda && matchBodega && matchVarietal && matchCategoria;
  });

  renderGrid(filtrados);
}

function initFiltros() {
  ['busqueda', 'filtroBodega', 'filtroVarietal', 'filtroCategoria'].forEach(id => {
    document.getElementById(id).addEventListener('input', aplicarFiltros);
    document.getElementById(id).addEventListener('change', aplicarFiltros);
  });

  document.getElementById('btnLimpiar').addEventListener('click', () => {
    document.getElementById('busqueda').value = '';
    document.getElementById('filtroBodega').value = '';
    document.getElementById('filtroVarietal').value = '';
    document.getElementById('filtroCategoria').value = '';
    aplicarFiltros();
  });
}

// ── MODAL DETALLE ─────────────────────────────────────────────────────────────

function abrirModal(producto) {
  _productoActualModal = producto;
  _cantidadModal = 1;

  document.getElementById('modalImg').src = producto.imagenUrl || '';
  document.getElementById('modalImg').alt = producto.nombre;
  document.getElementById('modalImg').style.display = producto.imagenUrl ? 'block' : 'none';
  document.getElementById('modalBodega').textContent = producto.bodega;
  document.getElementById('modalNombre').textContent = producto.nombre;
  document.getElementById('modalVarietal').textContent = producto.varietal;
  document.getElementById('modalDesc').textContent = producto.descripcion || 'Vino de alta selección.';
  document.getElementById('modalPrecioUnit').textContent = formatPrecio(producto.precioUnitario);
  document.getElementById('qtyValue').textContent = '1';

  const cajaWrap = document.getElementById('modalPrecioCajaWrap');
  if (producto.precioCaja) {
    document.getElementById('modalBotellas').textContent = `Caja x${producto.botellasXCaja}`;
    document.getElementById('modalPrecioCaja').textContent = formatPrecio(producto.precioCaja);
    cajaWrap.style.display = 'flex';
  } else {
    cajaWrap.style.display = 'none';
  }

  document.getElementById('modalOverlay').classList.add('open');
  document.getElementById('modalProducto').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modalProducto').classList.remove('open');
  document.body.style.overflow = '';
  _productoActualModal = null;
}

function initModal() {
  document.getElementById('modalClose').addEventListener('click', cerrarModal);
  document.getElementById('modalOverlay').addEventListener('click', cerrarModal);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarModal();
  });

  document.getElementById('qtyMinus').addEventListener('click', () => {
    if (_cantidadModal > 1) {
      _cantidadModal--;
      document.getElementById('qtyValue').textContent = _cantidadModal;
    }
  });
  document.getElementById('qtyPlus').addEventListener('click', () => {
    _cantidadModal++;
    document.getElementById('qtyValue').textContent = _cantidadModal;
  });

  document.getElementById('btnAgregarModal').addEventListener('click', () => {
    if (!_productoActualModal) return;
    Carrito.agregar(_productoActualModal, _cantidadModal);
    mostrarToast(`${_cantidadModal} × "${_productoActualModal.nombre}" agregado`);
    cerrarModal();
  });
}

// ── TOAST ─────────────────────────────────────────────────────────────────────

function mostrarToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── INIT PRINCIPAL ────────────────────────────────────────────────────────────

async function initProductos() {
  _todosLosProductos = await fetchProductos();
  poblarFiltros(_todosLosProductos);
  renderGrid(_todosLosProductos);
  initFiltros();
  initModal();
}
