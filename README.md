# Invitación — Annia Gissel cumple 3

Página estática para la fiesta del **sábado 5 de septiembre de 2026, 14:00**, en Cochabamba.
Recoge la confirmación de asistencia y, sobre todo, **el nombre completo de cada niño**,
que la artista necesita con anticipación para preparar las cerámicas.

## Links personalizados

El link se arma con el número de niños de cada familia:

| Link | Qué muestra |
|---|---|
| `...github.io/cumple-annia/` | 1 campo de nombre |
| `...github.io/cumple-annia/?ninos=2` | 2 campos, uno por hermano |
| `...github.io/cumple-annia/?ninos=3&fam=Familia%20Pérez` | 3 campos + saludo con el apellido |

`ninos` acepta de 1 a 6. Si falta o viene con basura, muestra 1 campo.
El espacio en `fam` se escribe `%20`.

## Falta poner (opcional, la página funciona sin esto)

Todo esto va en `assets/`. Si un archivo no está, esa parte simplemente no aparece
en lugar de romperse:

- `pinata.jpg` — foto de la piñata. Se usa de fondo del hero y como imagen del link
  al compartirlo por WhatsApp. **Es la que más se nota: sin ella el link se comparte sin foto.**
- `video.mp4` — si existe, aparece una sección de video en bucle y sin sonido.
- `musica.m4a` — si existe, aparece el botón de música abajo a la derecha.
  Va en AAC 96 kbps: al ser el archivo más pesado de la página, el mp3 original
  de 192 kbps pesaba el doble sin diferencia audible de fondo.

## Conectar la hoja de cálculo

1. Nueva hoja en Google Sheets.
2. Extensiones → Apps Script. Borrar todo y pegar `google_apps_script.js`.
3. Implementar → Nueva implementación → **Aplicación web**
   · Ejecutar como: **Yo** · Quién tiene acceso: **Cualquier persona**
4. Copiar la URL que termina en `/exec`.
5. Pegarla en `app.js`, en `GOOGLE_SHEET_WEBHOOK_URL` (reemplazando `'PENDIENTE'`).

Mientras diga `PENDIENTE`, la confirmación por WhatsApp funciona igual; solo no se
guarda la fila en la hoja.

Columnas: Fecha · Confirma · Teléfono · Asiste · Confirmado con · Cantidad de niños ·
Nombres de los niños · Link usado.

## Publicar

```
git remote add origin https://github.com/richi007dx/cumple-annia.git
git push -u origin main
```

Luego en GitHub: Settings → Pages → Deploy from branch → `main` / `root`.

## Notas para tocar el código

- **El orden en `handleRSVP` importa.** WhatsApp se abre con `window.open` *antes*
  del `fetch`, dentro del contexto del clic. Si se invierte, Safari y Chrome
  bloquean la ventana. Es el mismo problema que ya se arregló en la página de la boda.
- Los `.reveal` tienen tres caminos para hacerse visibles (barrido inicial,
  IntersectionObserver y un timeout de 2.5s). La animación es un adorno; que el
  contenido se vea no es negociable.
- La cuenta regresiva está anclada a `2026-09-05T14:00:00-04:00`, así que da la
  hora correcta desde cualquier zona horaria.
