/* ============================================================
   Cumple de Annia Gissel — 3 años
   ============================================================ */
(function () {
  'use strict';

  // --- Configuración ---------------------------------------------------
  var FIESTA = new Date('2026-09-05T14:00:00-04:00'); // Bolivia es UTC-4 todo el año
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

})();
