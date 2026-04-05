/**
 * MÓDULO CHECKOUT — MercadoPago Checkout Pro
 * Llama a la Netlify Function que crea la preferencia en la API de MP
 * y redirige al usuario al checkout hosted de MercadoPago.
 */

(function initCheckout() {
  const btnCheckout = document.getElementById('btnCheckout');

  btnCheckout.addEventListener('click', async () => {
    const items = Carrito.getItems();
    if (items.length === 0) return;

    btnCheckout.disabled = true;
    btnCheckout.textContent = 'Procesando...';

    try {
      const resp = await fetch('/.netlify/functions/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            nombre: i.nombre,
            cantidad: i.cantidad,
            precio: i.precioUnitario,
          }))
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const { init_point } = await resp.json();
      if (!init_point) throw new Error('No se recibió URL de pago.');

      // Redirigir a MercadoPago
      window.location.href = init_point;

    } catch (err) {
      console.error('[Checkout]', err);
      alert('Hubo un problema al iniciar el pago. Por favor intentá de nuevo o contactanos por WhatsApp.');
      btnCheckout.disabled = false;
      btnCheckout.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="1" y="4" width="22" height="16" rx="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        Pagar con MercadoPago
      `;
    }
  });
})();
