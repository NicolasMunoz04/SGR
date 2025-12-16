/* ==============================================
   Habitaciones.js — Modal galería con ficha lateral (opción B)
   - Abre al click en la IMAGEN de la card
   - data-images: JSON ['...'] o "a.jpg,b.jpg"
   - Ficha lateral poblada desde data-atributos o contenido de la card
============================================== */

(function () {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener('DOMContentLoaded', () => {
    const modal    = $('#gallery-modal');
    if (!modal) { console.error('[Habitaciones] No existe #gallery-modal'); return; }

    // Elementos del modal
    const imgEl    = $('.gm-img', modal);
    const prevBtn  = $('.gm-prev', modal);
    const nextBtn  = $('.gm-next', modal);
    const closeBtn = $('.gm-close', modal);
    const dotsWrap = $('.gm-dots', modal);
    const backdrop = $('.gm-backdrop', modal);

    // Ficha lateral
    const titleEl = $('#gm-title', modal);
    const descEl  = $('#gm-desc',  modal);
    const amEl    = $('#gm-amenities', modal);
    const capEl   = $('#gm-capacity',  modal);
    const priceEl = $('#gm-price',     modal);
    const ctaEl   = $('#gm-cta',       modal);

    if (!imgEl || !prevBtn || !nextBtn || !closeBtn || !dotsWrap || !backdrop || !titleEl || !descEl || !amEl || !capEl || !priceEl || !ctaEl) {
      console.error('[Habitaciones] El modal está incompleto (faltan nodos). Revisá el HTML de la opción B.');
      return;
    }

    const cardImages    = $$('.habitaciones .card img');
    const consultarBtns = $$('.habitaciones .card .btn');

    let imgs = [];
    let idx  = 0;

    // Evitar drag fantasma
    document.addEventListener('dragstart', e => e.preventDefault(), true);

    // Obtiene imágenes desde data-images (JSON o csv)
    function imagesFrom(card){
      let raw = card.dataset.images || '';
      let arr;

      if (raw.trim().startsWith('[')) {
        try { arr = JSON.parse(raw); } catch (err) {
          console.error('[Habitaciones] data-images JSON inválido en card:', card, err);
          arr = [];
        }
      } else {
        arr = raw.split(',');
      }

      const out = arr
        .map(s => (s || '').trim())
        .filter(s => /\.(jpe?g|png|webp|gif)$/i.test(s));

      if (out.length === 0) {
        console.warn('[Habitaciones] data-images vacío o sin extensiones válidas en card:', card.dataset.images);
      }
      return out;
    }

    // Llena la ficha desde data-* o contenido de la card
    function fillDetails(fromCard){
      if (!fromCard) return;
      const d = fromCard.dataset;

      titleEl.textContent = d.title || fromCard.querySelector('h3')?.textContent || 'Habitación';
      descEl.textContent  = d.desc  || fromCard.querySelector('p')?.textContent  || '';

      // amenities: "WiFi, TV, Baño privado"
      amEl.innerHTML = '';
      (d.amenities ? d.amenities.split(',') : [])
        .map(s => s.trim()).filter(Boolean)
        .forEach(a => { const li = document.createElement('li'); li.textContent = a; amEl.appendChild(li); });

      capEl.textContent   = d.capacity || '';
      priceEl.textContent = d.price || '';

      const btn = fromCard.querySelector('.btn');
      if (btn && btn.href) ctaEl.href = btn.href; else ctaEl.removeAttribute('href');
    }

    function openModal(images, startIndex = 0) {
      imgs = images;
      idx  = startIndex;
      if (!imgs.length) {
        console.warn('[Habitaciones] No hay imágenes para mostrar. Verificá rutas y extensiones.');
        return;
      }
      renderGallery();
      modal.classList.add('is-open');
      document.body.classList.add('modal-open');
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.classList.remove('modal-open');
    }

    function renderGallery() {
      if (!imgs.length) return;
      imgEl.src = imgs[idx].trim();

      // Dots
      dotsWrap.innerHTML = imgs
        .map((_, i) => `<button class="gm-dot ${i === idx ? 'is-active' : ''}" data-i="${i}" aria-label="Ir a imagen ${i + 1}"></button>`)
        .join('');

      dotsWrap.querySelectorAll('.gm-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          idx = Number(dot.dataset.i) || 0;
          renderGallery();
        });
      });
    }

    function next() {
      if (!imgs.length) return;
      idx = (idx + 1) % imgs.length;
      renderGallery();
    }

    function prev() {
      if (!imgs.length) return;
      idx = (idx - 1 + imgs.length) % imgs.length;
      renderGallery();
    }

    // Controles del modal
    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    // Click sobre la foto grande = siguiente
    imgEl.addEventListener('click', next);

    // Si una imagen falla, la removemos y seguimos
    imgEl.addEventListener('error', () => {
      if (!imgs.length) return;
      const rota = imgs[idx];
      console.warn('[Habitaciones] Imagen rota, se salta:', rota);
      imgs.splice(idx, 1);
      if (!imgs.length) {
        closeModal();
      } else {
        idx = idx % imgs.length;
        renderGallery();
      }
    });

    // Navegación por teclado
    window.addEventListener('keydown', e => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape')     closeModal();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    });

    // CLICK SOLO EN LA IMAGEN DE LA CARD
    const TAP_THRESHOLD = 6; // px entre down y up

    cardImages.forEach(img => {
      img.style.pointerEvents = 'auto';
      img.setAttribute('draggable', 'false');

      img.addEventListener('dragstart', e => e.preventDefault());
      img.addEventListener('mousedown', e => { if (e.button === 0) e.preventDefault(); });

      let startX = 0, startY = 0, moved = false;

      img.addEventListener('pointerdown', e => {
        startX = e.clientX; startY = e.clientY; moved = false;
      });

      img.addEventListener('pointermove', e => {
        if (Math.abs(e.clientX - startX) > TAP_THRESHOLD ||
            Math.abs(e.clientY - startY) > TAP_THRESHOLD) {
          moved = true;
        }
      });

      img.addEventListener('pointerup', e => {
        if (moved) return; // fue arrastre
        e.preventDefault();
        e.stopPropagation();

        const card = img.closest('.card');
        if (!card) {
          console.warn('[Habitaciones] No se encontró .card contenedora de la imagen clickeada.');
          return;
        }

        const arr = imagesFrom(card);
        if (arr.length) {
          openModal(arr, 0);
          fillDetails(card); // ← carga la ficha
        } else {
          console.warn('[Habitaciones] Esta card no tiene imágenes válidas en data-images:', card.dataset.images);
        }
      }, { passive: false });

      // Touch
      img.addEventListener('touchend', e => {
        const card = img.closest('.card');
        if (!card) return;
        const arr = imagesFrom(card);
        if (arr.length) { openModal(arr, 0); fillDetails(card); }
      }, { passive: true });
    });

    // Botón consultar: no interferir
    consultarBtns.forEach(btn => {
      btn.addEventListener('click', e => e.stopPropagation());
    });

    console.log('[Habitaciones] Opción B activa. Imágenes clickeables:', cardImages.length);
  });
})();