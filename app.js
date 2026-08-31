/* ============================================================
   Cumple de Annia Gissel — 3 años
   ============================================================ */
(function () {
  'use strict';

  // --- Configuración ---------------------------------------------------
  var FIESTA = new Date('2026-09-05T14:00:00-04:00'); // Bolivia es UTC-4 todo el año
  var WA_PAPA = '59179710021';   // Jaime Richard
  var WA_MAMA = '59160376893';   // Dayana Alejandra
  var MAX_NINOS = 6;

  // Despliegue de Apps Script que escribe en la hoja de confirmaciones.
  // Si algún día hay que rehacerlo, ojo: al editar el script no basta con
  // guardar, hay que publicar una versión nueva o la URL sirve el código viejo.
  var GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxrVSzobEx-RbqauA8pG0oO_22UxxU2DW7B1nE599JYpMPsj4jnCfSfpq3fRu52tFQS/exec';

  var $ = function (id) { return document.getElementById(id); };

  // ===== SEMÁFORO DE LARGADA ==========================================
  (function largada() {
    var overlay = $('start-overlay');
    if (!overlay) return;

    var luces = Array.prototype.slice.call(document.querySelectorAll('.start-light'));
    var go = $('start-go');
    var hint = $('start-hint');
    var cerrado = false;

    function entrar(conToque) {
      if (cerrado) return;
      cerrado = true;
      if (conToque) reproducirIntro(); // el gesto que el navegador exige
      overlay.classList.add('fade-out');
      setTimeout(function () { overlay.style.display = 'none'; }, 700);
      burstConfetti(34);
    }

    luces.forEach(function (l, k) {
      setTimeout(function () { l.classList.add('on'); }, 500 + k * 550);
    });

    var finLuces = 500 + luces.length * 550;

    setTimeout(function () {
      luces.forEach(function (l) { l.classList.remove('on'); l.classList.add('go'); });
      if (go) go.classList.add('show');
      if (hint) hint.classList.add('show');
      overlay.classList.add('armed');
      overlay.addEventListener('click', function () { entrar(true); });
    }, finLuces);

    // Si nadie toca, la invitación se abre igual a los 8 s. Nadie se queda
    // mirando una pantalla negra por no entender que había que tocar.
    setTimeout(function () { entrar(false); }, finLuces + 8000);
  })();

  // ===== FOTO DEL HERO (si no existe, se oculta) ======================
  (function heroPhoto() {
    var img = $('hero-photo');
    if (!img) return;
    img.addEventListener('error', function () { img.classList.add('missing'); });
    if (img.complete && img.naturalWidth === 0) img.classList.add('missing');
  })();

  // ===== RECORTE SIN FONDO (opcional) =================================
  // Si assets/heroes.png existe, manda él y se esconde el auto dibujado.
  // Si no, no pasa nada: el SVG sigue siendo el plan A.
  (function heroCutout() {
    var img = $('hero-cutout');
    var track = document.querySelector('.car-track');
    if (!img || !track) return;

    function usar() {
      img.classList.add('ready');
      track.classList.add('has-cutout');
    }

    // OJO: el <img> está en el HTML, así que en una visita repetida ya viene
    // de caché y su evento 'load' se disparó ANTES de que corriera este script.
    // Si solo escucháramos el evento, el recorte desaparecería en la segunda
    // visita. Por eso primero se pregunta si ya terminó de cargar.
    if (img.complete) {
      if (img.naturalWidth > 0) usar(); else img.remove();
    } else {
      img.addEventListener('load', usar);
      img.addEventListener('error', function () { img.remove(); });
    }
  })();

  // ===== VIDEO OPCIONAL ===============================================
  (function optionalVideo() {
    var section = $('video-section');
    var video = $('hero-video');
    var soundBtn = $('video-sound');
    if (!section || !video) return;

    // Solo mostramos la sección si el archivo realmente carga.
    video.addEventListener('loadeddata', function () {
      section.classList.remove('hidden');
      video.play().catch(function () { /* el navegador puede bloquear; no pasa nada */ });
    });
    video.addEventListener('error', function () { section.classList.add('hidden'); });
    video.src = 'assets/video.mp4';

    if (soundBtn) {
      soundBtn.addEventListener('click', function () {
        video.muted = !video.muted;
        soundBtn.textContent = video.muted ? '🔇' : '🔊';
        if (!video.muted) video.play().catch(function () {});
      });
    }
  })();

  // ===== CUENTA REGRESIVA =============================================
  (function countdown() {
    var grid = $('cd-grid');
    var live = $('cd-live');
    var dEl = $('cd-days'), hEl = $('cd-hours'), mEl = $('cd-min'), sEl = $('cd-sec');
    if (!grid || !dEl) return;

    var pad = function (n) { return n < 10 ? '0' + n : String(n); };

    function tick() {
      var diff = FIESTA.getTime() - Date.now();

      if (diff <= 0) {
        grid.classList.add('hidden');
        if (live) live.classList.remove('hidden');
        return true; // terminado
      }

      var secs = Math.floor(diff / 1000);
      dEl.textContent = Math.floor(secs / 86400);
      hEl.textContent = pad(Math.floor(secs / 3600) % 24);
      mEl.textContent = pad(Math.floor(secs / 60) % 60);
      sEl.textContent = pad(secs % 60);
      return false;
    }

    if (!tick()) {
      var timer = setInterval(function () {
        if (tick()) clearInterval(timer);
      }, 1000);
    }
  })();

  // ===== PARÁMETROS DEL LINK ==========================================
  var params = new URLSearchParams(window.location.search);

  var nNinos = parseInt(params.get('ninos'), 10);
  if (isNaN(nNinos) || nNinos < 1) nNinos = 1;
  if (nNinos > MAX_NINOS) nNinos = MAX_NINOS;

  var familia = (params.get('fam') || '').trim().slice(0, 60);

  (function greeting() {
    var el = $('rsvp-greeting');
    if (!el) return;
    var quienes = nNinos === 1 ? 'del niño' : 'de los niños';
    // textContent, nunca innerHTML: el valor viene de la URL.
    el.textContent = familia
      ? familia + ', necesitamos el nombre ' + quienes + ' con anticipación.'
      : 'Necesitamos el nombre ' + quienes + ' con anticipación.';
  })();

  (function kidsFields() {
    var wrap = $('kids-fields');
    var word = $('kids-word');
    if (!wrap) return;

    if (word) word.textContent = nNinos === 1 ? 'el niño' : 'cada niño';

    for (var i = 1; i <= nNinos; i++) {
      var input = document.createElement('input');
      input.type = 'text';
      input.className = 'kid-name';
      input.autocomplete = 'off';
      input.placeholder = nNinos === 1
        ? 'Nombre y apellidos'
        : 'Niño ' + i + ' — nombre y apellidos';
      input.setAttribute('aria-label', 'Nombre completo del niño ' + i);
      wrap.appendChild(input);
    }
  })();

  // ===== ¿ASISTEN? ====================================================
  var kidsBlock = $('kids-block');

  function asiste() {
    var checked = document.querySelector('input[name="attend"]:checked');
    return !checked || checked.value === 'si';
  }

  Array.prototype.forEach.call(document.querySelectorAll('input[name="attend"]'), function (r) {
    r.addEventListener('change', function () {
      if (kidsBlock) kidsBlock.classList.toggle('disabled', !asiste());
    });
  });

  // ===== CONFIRMACIÓN =================================================
  var btnPapa = $('btn-papa');
  var btnMama = $('btn-mama');
  var errEl = $('rsvp-error');

  function showError(msg, focusEl) {
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove('hidden');
    }
    if (focusEl) {
      focusEl.classList.add('invalid');
      focusEl.focus();
      focusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function clearError() {
    if (errEl) errEl.classList.add('hidden');
    Array.prototype.forEach.call(document.querySelectorAll('.invalid'), function (el) {
      el.classList.remove('invalid');
    });
  }

  function handleRSVP(phone, quien) {
    clearError();

    var parentEl = $('rsvp-parent');
    var phoneEl = $('rsvp-phone');
    var parent = parentEl ? parentEl.value.trim() : '';
    var guestPhone = phoneEl ? phoneEl.value.trim() : '';
    var viene = asiste();

    if (!parent) {
      showError('Por favor escribe tu nombre para saber quién confirma.', parentEl);
      return;
    }

    var nombres = [];
    if (viene) {
      var inputs = Array.prototype.slice.call(document.querySelectorAll('.kid-name'));
      for (var i = 0; i < inputs.length; i++) {
        var v = inputs[i].value.trim();
        if (!v) {
          showError('Falta el nombre completo del niño ' + (i + 1) + '. Lo necesitamos para la cerámica.', inputs[i]);
          return;
        }
        nombres.push(v);
      }
    }

    // 1. Armar el mensaje ANTES de cualquier llamada asíncrona.
    var text;
    if (viene) {
      text = '¡Hola! Soy *' + parent + '*.\n'
        + 'Confirmo la asistencia al cumple de *Annia Gissel* 🎉\n\n'
        + (nombres.length === 1 ? 'Niño que asiste:\n' : 'Niños que asisten:\n')
        + nombres.map(function (n) { return '• ' + n; }).join('\n');
    } else {
      text = '¡Hola! Soy *' + parent + '*.\n'
        + 'Lamentablemente *no podremos asistir* al cumple de Annia Gissel, '
        + 'pero le mandamos un abrazo grande. 🎂';
    }

    // 2. Abrir WhatsApp INMEDIATAMENTE, dentro del contexto del clic.
    //    Si esto se mueve después del fetch, Safari y Chrome bloquean el popup.
    //    (Mismo fix que en la página de la boda, commit 43dcab7.)
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank');

    // 3. Marcar los botones como usados.
    [btnPapa, btnMama].forEach(function (b) {
      if (!b) return;
      b.disabled = true;
      var top = b.querySelector('.bc-top');
      var sub = b.querySelector('.bc-sub');
      if (top) top.textContent = (b === (quien === 'Papá' ? btnPapa : btnMama))
        ? '¡Gracias por confirmar!'
        : 'Confirmación enviada';
      if (sub) sub.textContent = 'Enviá el mensaje de WhatsApp';
    });

    burstConfetti(60);

    // 4. Guardar en la hoja, en segundo plano.
    if (GOOGLE_SHEET_WEBHOOK_URL && GOOGLE_SHEET_WEBHOOK_URL !== 'PENDIENTE') {
      fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          confirma: parent,
          telefono: guestPhone,
          asiste: viene ? 'Sí' : 'No',
          confirmadoCon: quien,
          cantidadNinos: nombres.length,
          nombresNinos: nombres.join('; '),
          linkUsado: window.location.search || '(sin parámetros)'
        })
      }).catch(function (err) { console.error('No se pudo guardar en la hoja:', err); });
    } else {
      console.warn('GOOGLE_SHEET_WEBHOOK_URL sin configurar: no se guardó en la hoja.');
    }
  }

  if (btnPapa) btnPapa.addEventListener('click', function () { handleRSVP(WA_PAPA, 'Papá'); });
  if (btnMama) btnMama.addEventListener('click', function () { handleRSVP(WA_MAMA, 'Mamá'); });

  // ===== MÚSICA DE FONDO ==============================================
  // Ningún navegador deja que el audio arranque solo: hace falta un gesto
  // del usuario. Por eso la pantalla de entrada pide un toque — ese toque
  // ES el permiso. Si alguien entra sin tocar, la música arranca en su
  // primera interacción, y si no, siempre queda el botón de la esquina.
  var audioDisponible = true;
  var vozDisponible = true;
  var musicaArrancada = false;

  function sincronizarBotonMusica() {
    var audio = $('bg-music'), btn = $('custom-audio-btn');
    var iPlay = $('icon-play'), iPause = $('icon-pause');
    if (!audio || !btn) return;
    if (audio.paused) {
      btn.classList.remove('playing');
      iPlay.classList.remove('hidden');
      iPause.classList.add('hidden');
    } else {
      btn.classList.add('playing');
      iPlay.classList.add('hidden');
      iPause.classList.remove('hidden');
    }
  }

  function iniciarMusica() {
    if (musicaArrancada || !audioDisponible) return;
    var audio = $('bg-music');
    if (!audio) return;
    audio.play().then(function () {
      musicaArrancada = true;
    }).catch(function (e) {
      // Si el navegador igual lo bloquea, no insistimos: queda el botón.
      console.log('El navegador bloqueó la reproducción:', e);
    });
  }

  // Primero habla Annia, después entra la canción. Si por lo que sea la voz
  // no está o no puede sonar, se pasa directo a la música: nunca se queda
  // todo en silencio esperando un audio que no va a llegar.
  var introArrancada = false;

  function reproducirIntro() {
    if (introArrancada) return;
    introArrancada = true;

    var voz = $('voz-annia');
    if (!voz || !vozDisponible) { iniciarMusica(); return; }

    voz.addEventListener('ended', iniciarMusica, { once: true });
    voz.volume = 1;
    voz.play().catch(function (e) {
      console.log('No se pudo reproducir la voz:', e);
      iniciarMusica();
    });
  }

  (function reproductor() {
    var audio = $('bg-music'), btn = $('custom-audio-btn');
    if (!audio || !btn) return;

    audio.addEventListener('error', function () {
      // Sin archivo de audio: escondemos el botón en vez de mostrar algo roto.
      audioDisponible = false;
      btn.style.display = 'none';
    });

    var voz = $('voz-annia');
    if (voz) voz.addEventListener('error', function () { vozDisponible = false; });

    audio.volume = 0.4;

    btn.addEventListener('click', function () {
      if (!audioDisponible) return;
      if (audio.paused) {
        musicaArrancada = false;
        iniciarMusica();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', sincronizarBotonMusica);
    audio.addEventListener('pause', sincronizarBotonMusica);
    sincronizarBotonMusica();

    // Red de seguridad para quien entró sin tocar la pantalla de largada.
    ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
      document.addEventListener(ev, reproducirIntro, { once: true, passive: true });
    });
  })();

  // ===== CONFETI ======================================================
  var CONFETTI_COLORS = ['#ff2d95', '#00e5ff', '#ffd23f', '#a855f7', '#e8102d', '#22e06a'];

  function burstConfetti(count) {
    var layer = $('confetti-layer');
    if (!layer) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    for (var i = 0; i < count; i++) {
      var c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.top = '-20px';
      c.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      c.style.animation = 'confettiFall ' + (2.6 + Math.random() * 2.4) + 's linear forwards';
      c.style.animationDelay = (Math.random() * 0.9) + 's';
      layer.appendChild(c);
      c.addEventListener('animationend', function () { this.remove(); });
    }
  }

  // ===== REVEAL AL SCROLL =============================================
  // La animación es un adorno; que el contenido se vea NO es negociable.
  // Por eso hay tres caminos hacia .in y basta con que uno funcione.
  (function reveals() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    var show = function (el) { el.classList.add('in'); };
    var pending = items.slice();

    // 1) Lo que ya está en pantalla se muestra sin esperar al observer.
    function sweep() {
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) { show(el); return false; }
        return true;
      });
      if (!pending.length) window.removeEventListener('scroll', sweep);
    }

    // 2) El observer, para el efecto bonito al ir bajando.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
        });
      }, { threshold: 0 });
      items.forEach(function (el) { io.observe(el); });
    }

    requestAnimationFrame(sweep);
    window.addEventListener('scroll', sweep, { passive: true });

    // 3) Red de seguridad: pase lo que pase, a los 2.5s no queda nada invisible.
    setTimeout(function () { items.forEach(show); }, 2500);
  })();

  // ===== PÍLDORA STICKY ===============================================
  (function stickyCta() {
    var pill = $('sticky-cta');
    var hero = $('hero');
    var form = $('confirmar');
    if (!pill || !hero || !form || !('IntersectionObserver' in window)) return;

    var pastHero = false, formVisible = false;
    var update = function () { pill.classList.toggle('show', pastHero && !formVisible); };

    new IntersectionObserver(function (e) {
      pastHero = !e[0].isIntersecting;
      update();
    }, { threshold: 0.15 }).observe(hero);

    new IntersectionObserver(function (e) {
      formVisible = e[0].isIntersecting;
      update();
    }, { threshold: 0.12 }).observe(form);
  })();

})();
