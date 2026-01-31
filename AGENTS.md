# AGENTS.md — Pelotitas Overlay

Este archivo resume las decisiones y cambios clave del proyecto para futuros agentes.

## Objetivo del overlay

- Mantener la atención en el video: las pelotitas son un estímulo suave, no un desafío.
- Visual: overlay transparente, minimalista, con HUD pequeño y discreto.
- Interacción: permitir “dejar pasar clics” para poder usar la app de abajo sin cerrar el juego.

## Comportamiento actual

- Ventana transparente, sin marco, siempre arriba por defecto.
- Click-through (dejar pasar clics) se puede alternar con un botón y con atajo.
- HUD mínimo: score, botón “Clicks pasan / Clicks se quedan”, botón “Salir”, y pills con atajos.

## Atajos globales (funcionan sin foco)

- Cmd/Ctrl + Shift + P: alterna click-through (dejar pasar clics).
- Cmd/Ctrl + Shift + O: alterna “siempre arriba”.
- Cmd/Ctrl + Shift + Q: salir.

## Ajustes de “calma”

- Menos pelotitas simultáneas.
- Aparición más lenta.
- Velocidad reducida.
- Pelotas no se achican demasiado: se eliminan cuando el radio baja de un umbral medio.

## Archivos clave

- `main.js`: crea la ventana Electron, atajos globales e IPC.
- `preload.js`: puente seguro para toggles (click-through, always-on-top, quit).
- `script.js`: lógica del juego, spawn, tamaños y estado del botón “Clicks pasan”.
- `index.html` / `style.css`: HUD minimalista y pills de atajos.

## Notas de UX

- El HUD debe ser pequeño y no robar atención.
- El botón “Clicks pasan” debe reflejar estado (aria-pressed + fill).
