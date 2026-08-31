# Invitación — Annia Gissel cumple 3

Página estática para la fiesta del **sábado 5 de septiembre de 2026, 14:00**,
en Cochabamba. Es solo una invitación: se comparte el link por WhatsApp y ya.
No pide datos ni confirma asistencia.

## Archivos en `assets/`

Si alguno falta, esa parte no aparece en vez de romperse:

- `heroes.png` — el recorte sin fondo. Manda en el hero; si no carga, sale un
  auto de carreras dibujado en SVG como respaldo.
- `pinata.jpg` — foto de la piñata. Va en el punto "La piñata" del programa y
  como fondo del hero.
- `og.jpg` — la imagen del preview al compartir el link. Es un recorte de la
  anterior a 1200x630, la proporción que WhatsApp y Facebook esperan. Va
  aparte y no reutiliza `pinata.jpg` porque las meta tags declaran el tamaño
  y esos clientes reservan el espacio del preview antes de bajar el archivo:
  si el número no coincide, el preview sale recortado o en miniatura.
- `voz.m4a` — nota de voz de Annia invitando. Suena primero, al tocar la
  pantalla de largada, y la canción entra recién cuando termina. Venía de
  WhatsApp en `.opus`, que Safari en iPhone no reproduce; por eso está en AAC.
- `musica.m4a` — música de fondo, en AAC 96 kbps. Es el archivo más pesado de
  la página, y solo se descarga si alguien le da play.
- `video.mp4` — opcional. Si existe, aparece una sección de video en bucle y
  sin sonido.

## Publicar

```
git push origin main
```

GitHub Pages sirve desde `main` / `root`. Tarda uno o dos minutos.

## Notas para tocar el código

- **El audio no puede arrancar solo.** Ningún navegador lo permite sin un gesto
  previo del usuario; por eso la pantalla de largada espera un toque. Hay tres
  caminos hacia la música: ese toque, la primera interacción si alguien entró
  sin tocar (la pantalla se abre sola a los 8 s), y el botón de la esquina.
- **`heroCutout` consulta `img.complete` antes de escuchar el evento `load`.**
  El `<img>` está en el HTML, así que en una visita repetida viene de caché y
  su evento ya se disparó. Escuchando solo el evento, el recorte se veía la
  primera vez y desaparecía la segunda.
- Los `.reveal` tienen tres caminos para hacerse visibles (barrido inicial,
  IntersectionObserver y un timeout de 2.5 s). La animación es un adorno; que
  el contenido se vea no es negociable.
- La cuenta regresiva está anclada a `2026-09-05T14:00:00-04:00`, así que da la
  hora correcta desde cualquier zona horaria.

## Historial

Hubo una versión con formulario de confirmación que guardaba los nombres de los
niños en una hoja de cálculo vía Google Apps Script. Se quitó a pedido. Si
alguna vez hace falta, está en el historial de git junto con
`google_apps_script.js` (ver el commit anterior a "La página pasa a ser solo
una invitación").
