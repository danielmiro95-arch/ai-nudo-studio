const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function lerp(a, b, t) { return a + (b - a) * t; }
function easeOut(t) { return 1 - Math.pow(1 - t, 2.5); }

/* ── Topbar ── */
function updateTopbar() {
  const header = document.querySelector('.topbar');
  if (!header) return;
  if (window.scrollY > 24) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}
updateTopbar();
window.addEventListener('scroll', updateTopbar, { passive: true });

/* ── Mobile nav hamburger ── */
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navToggle.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', false);
    });
  });
}

/* ── Reveal on scroll ── */
if (!prefersReducedMotion) {
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(el => observer.observe(el));

  document.querySelectorAll('.service-card, .gallery-card, .card, .stat, .social-link, .process-card, .metric-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ── Hero Scroll Animation ─────────────────────────────────────────────────

   DOS CAPAS, MISMA IMAGEN:
   ┌─────────────────────────────────────────────────────────┐
   │  heroBg  (z:1) — imagen full-screen con mask-image      │
   │  heroMask (z:2) — card centrada, siempre fija y nítida  │
   └─────────────────────────────────────────────────────────┘

   MECÁNICA:
   · heroMask: posición y tamaño FIJOS (CARD_W × IMG_H, centrada).
     La imagen interior usa counter-offset para mostrar exactamente el
     mismo región de píxeles que heroBg en el área de la card → sin seam.
     border-radius visible desde p=0. Solo la sombra crece con p.

   · heroBg: full-screen, QUIETA (sin translate, sin scale).
     Se le aplica un mask-image de dos gradientes lineales intersectados
     (horizontal + vertical) que hace desaparecer la imagen desde el borde
     de la card HACIA AFUERA:
       - p=0 → mask completamente negro → imagen 100% visible
       - p→1 → bordes de pantalla se vuelven transparentes;
               el borde de la card permanece negro (opaco)
               → el blanco del sticky aparece desde los extremos hacia la card

   PROGRESO: p = easeOut(scroll / maxScroll), 0 → 1
   ─────────────────────────────────────────────────────────────────────────── */
(function initHeroScroll() {
  const section      = document.getElementById('heroRevolut');
  if (!section) return;

  const sticky       = document.getElementById('heroSticky');
  const heroBg       = document.getElementById('heroBg');
  const heroMask     = document.getElementById('heroMask');
  const heroCardCopy = document.getElementById('heroCardCopy');
  const leftCard     = document.getElementById('leftCard');
  const rightCard    = document.getElementById('rightCard');
  const frontCopy    = document.getElementById('frontCopy');
  const heroEndTitle = document.getElementById('heroEndTitle');

  const CARD_W     = 290;
  const IMG_H      = 380;
  const CARD_W_BIG = 396;   // tamaño inicial de la card central (grande)
  const IMG_H_BIG  = 432;
  const BORDER  = 0;
  const SIDE_W  = 290;
  const SIDE_H  = 380;
  const GAP     = 24;
  const RADIUS  = 32;

  const heroCardRing = document.getElementById('heroCardRing');
  const maskImg = heroMask ? heroMask.querySelector('img') : null;
  if (frontCopy) frontCopy.classList.add('in-view');

  let heroRaw  = 0;
  let heroLocked = true;

  function update() {
    const W = sticky.offsetWidth  || window.innerWidth;
    const H = sticky.offsetHeight || window.innerHeight;
    const p = easeOut(heroRaw);

    // Fondo: baja suavemente durante la transición
    if (heroBg) {
      const bgScale = lerp(1.085, 0.98, Math.min(1, p * 2));
      heroBg.style.transform = `scale(${bgScale.toFixed(3)}) translateY(${lerp(0, 80, Math.min(1, p * 3.5)).toFixed(1)}px)`;
    }

    // Card central: se achica desde BIG; queda un poco más larga que las laterales
    const CARD_W_SMALL    = Math.round(CARD_W * 0.82);  // 238
    const IMG_H_SMALL     = Math.round(IMG_H  * 0.82);  // 312 (laterales)
    const IMG_H_CENTER_END = IMG_H;                      // 380 (centro, más larga)
    const cW = Math.round(lerp(CARD_W_BIG, CARD_W_SMALL,    p));
    const cH = Math.round(lerp(IMG_H_BIG,  IMG_H_CENTER_END, p));

    // Cards laterales: encogen en la fase final (p: 0.6→1)
    // Cards laterales: progresan igual que la principal (p: 0.5→1)
    const sideP = Math.max(0, (p - 0.5) / 0.5);

    const cL = Math.round((W - cW) / 2);
    const cT = Math.round(lerp(H - IMG_H_BIG, H - IMG_H_CENTER_END - 90, p)) - 22;

    if (heroMask) {
      heroMask.style.left         = `${cL}px`;
      heroMask.style.top          = `${cT}px`;
      heroMask.style.width        = `${cW}px`;
      heroMask.style.height       = `${cH}px`;
      heroMask.style.borderRadius = `${RADIUS}px`;
      heroMask.style.border       = 'none';
      // Marco blanco visible desde el inicio + sombra de profundidad
      const dropShadow = p > 0.05
        ? `0 ${lerp(0, 40, p)}px ${lerp(0, 90, p)}px rgba(0,0,0,${lerp(0, 0.14, p)})`
        : '';
      heroMask.style.boxShadow = dropShadow
        ? `0 0 0 2px #b0b0b0, ${dropShadow}`
        : '0 0 0 2px #b0b0b0';
    }

    // Zoom en la foto: arranca muy acercado y se aleja con la animación
    if (maskImg) {
      const zoom = lerp(2.2, 1, p) * 1.012;
      const yOff = lerp(-56, -15, p);
      maskImg.style.transform = `scale(${zoom.toFixed(3)}) translateY(${yOff.toFixed(1)}%)`;
    }

    if (heroCardRing) {
      heroCardRing.style.left         = `${cL}px`;
      heroCardRing.style.top          = `${cT}px`;
      heroCardRing.style.width        = `${cW}px`;
      heroCardRing.style.height       = `${cH}px`;
      heroCardRing.style.borderRadius = `${RADIUS}px`;
      const ringP = Math.min(1, p * 2.5);
      heroCardRing.style.boxShadow    = `0 0 0 ${Math.round(lerp(0, 2400, ringP))}px #f7f7f5`;
    }

    // Overlay de texto: cubre la card completa con gradiente en la parte baja
    if (heroCardCopy) {
      heroCardCopy.style.left         = `${cL}px`;
      heroCardCopy.style.top          = `${cT}px`;
      heroCardCopy.style.width        = `${cW}px`;
      heroCardCopy.style.height       = `${cH}px`;
      heroCardCopy.style.borderRadius = `${RADIUS}px`;
      heroCardCopy.style.opacity      = String(Math.max(0, (p - 0.7) / 0.3));
      heroCardCopy.style.pointerEvents = p > 0.85 ? 'auto' : 'none';
    }

    if (frontCopy) {
      const op = Math.max(0, 1 - p * 2.2);
      frontCopy.style.opacity       = String(op);
      frontCopy.style.transform     = `translateY(${p * -50}px)`;
      frontCopy.style.pointerEvents = op < 0.05 ? 'none' : 'auto';
    }

    if (heroEndTitle) {
      const titleP = Math.max(0, (p - 0.6) / 0.4);
      heroEndTitle.style.opacity   = String(titleP);
      heroEndTitle.style.transform = `translateY(${lerp(-40, 0, titleP)}px)`;
    }

    // Cards laterales: empiezan grandes (como la principal) y se achican
    const showSides = W >= 700;
    const sideW  = Math.round(lerp(CARD_W_BIG, SIDE_W * 0.82, sideP));
    const sideH  = Math.round(lerp(IMG_H_BIG,  SIDE_H * 0.82, sideP));
    const sideTop = cT + (cH - sideH) / 2;

    const sideStyle = (card, left, rotateStart) => {
      if (!showSides) { card.style.opacity = '0'; return; }
      card.style.width        = `${sideW}px`;
      card.style.height       = `${sideH}px`;
      card.style.overflow     = 'hidden';
      card.style.left         = `${left}px`;
      card.style.top          = `${sideTop}px`;
      card.style.opacity      = String(Math.max(0, Math.min(1, sideP * 2)));
      card.style.transform    = `rotate(${lerp(rotateStart, 0, sideP)}deg)`;
      card.style.borderRadius = `${RADIUS}px`;
    };

    if (leftCard)  sideStyle(leftCard,  cL - sideW - GAP, -5);
    if (rightCard) sideStyle(rightCard, cL + cW    + GAP,   5);
  }

  if (!prefersReducedMotion) {
    // Wheel: intercepta scroll y conduce la animación sin mover la página
    window.addEventListener('wheel', (e) => {
      if (!heroLocked) return;
      e.preventDefault();
      heroRaw = Math.max(0, Math.min(1, heroRaw + e.deltaY / 1200));
      update();
      if (heroRaw >= 1) heroLocked = false;
    }, { passive: false });

    // Touch: mismo para móvil
    let touchY = 0;
    window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!heroLocked) return;
      e.preventDefault();
      const delta = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      heroRaw = Math.max(0, Math.min(1, heroRaw + delta / 600));
      update();
      if (heroRaw >= 1) heroLocked = false;
    }, { passive: false });

    window.addEventListener('resize', update, { passive: true });
  }
  requestAnimationFrame(update);
})();

/* ── Contact form handler ── */
const contactForm = document.querySelector('.contact-card form');
if (contactForm) {
  const btn = contactForm.querySelector('button');
  btn.addEventListener('click', () => {
    const name  = contactForm.querySelector('input[type="text"]').value.trim();
    const email = contactForm.querySelector('input[type="email"]').value.trim();
    const msg   = contactForm.querySelector('textarea').value.trim();

    if (!name || !email || !msg) {
      const orig = btn.textContent;
      btn.textContent = 'Completa todos los campos';
      btn.style.background = 'linear-gradient(135deg, #8b0000, #b22222)';
      setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 2200);
      return;
    }

    btn.textContent = '¡Mensaje enviado!';
    btn.disabled = true;
    btn.style.background = 'linear-gradient(135deg, #1a6b3a, #27ae60)';
    contactForm.reset();
    setTimeout(() => {
      btn.textContent = 'Enviar consulta';
      btn.disabled = false;
      btn.style.background = '';
    }, 3500);
  });
}

// Formulario de contacto: abre el cliente de correo con el mensaje ya redactado.
// Para recibirlo sin depender del correo del usuario, sustituir por Formspree/Netlify Forms.
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const subject = `Consulta de ${d.get('nombre')}`;
    const body = `Nombre: ${d.get('nombre')}\nEmail: ${d.get('email')}\n\n${d.get('mensaje')}`;
    window.location.href = `mailto:info@ainudostudio.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const status = document.getElementById('formStatus');
    status.hidden = false;
    status.textContent = 'Se ha abierto tu correo con el mensaje listo. Si no se abre, escríbenos a info@ainudostudio.com.';
  });
})();

/* ── Vídeos: solo se reproducen cuando están en pantalla ── */
(function () {
  const vids = document.querySelectorAll('video[autoplay]');
  if (!vids.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting && !prefersReducedMotion) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.25 });
  vids.forEach(v => { v.removeAttribute('autoplay'); v.preload = 'metadata'; io.observe(v); });
})();

/* ── Botón flotante de WhatsApp (número en un solo sitio) ── */
const WHATSAPP_NUMBER = '34600000000'; // TODO: número real
(function () {
  if (document.querySelector('.wa-float')) return;
  const a = document.createElement('a');
  a.className = 'wa-float';
  a.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, me gustaría pedir una propuesta')}`;
  a.target = '_blank'; a.rel = 'noopener';
  a.setAttribute('aria-label', 'Escríbenos por WhatsApp');
  a.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z"/></svg>';
  document.body.appendChild(a);
})();

/* ── Pestañas de tarifas ── */
document.querySelectorAll('.price-tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.price-tabs button').forEach(b => b.setAttribute('aria-selected', b === btn));
    document.querySelectorAll('.price-panel').forEach(p => { p.hidden = p.id !== btn.getAttribute('aria-controls'); });
  });
});

/* ── Contacto: rellenar el mensaje con el paquete elegido (?paquete=...) ── */
(function () {
  const pkg = new URLSearchParams(location.search).get('paquete');
  const ta = document.querySelector('#contactForm textarea');
  if (pkg && ta && !ta.value) ta.value = `Me interesa el paquete «${pkg}». `;
})();
