# Tic-Tac-Toe Premium

Juego de tres en raya con UI/UX moderna, accesible y responsiva.

## Características
- Modo PvP y PvC con 3 dificultades (Fácil/Medio/Difícil)
- Deshacer (Undo)
- Preferencias: Sonido y Vibración (persisten en localStorage)
- Selector de jugador inicial (X u O). En PvC, si empieza O, la IA abre
- Navegación por teclado: flechas para moverse, Enter/Espacio para jugar
- Accesibilidad ARIA y foco en modales
- Animaciones, partículas y confetti

## Ejecutar localmente
Puedes abrir `index.html` directamente en el navegador o levantar un servidor estático:

```powershell
# con http-server (npx)
npx http-server -p 5173 -c-1
```

Luego abre:

- http://localhost:5173/

No hay 404 de favicon: se incluyó un favicon por data URL.

## Atajos
- Flechas: Mover foco entre celdas
- Enter/Espacio: Colocar ficha
- Escape: Cerrar modales

## Problemas comunes
- Si no escuchas sonido, revisa que el interruptor de sonido esté activo y que el navegador permita audio tras una interacción.
- En móviles, la vibración depende del soporte del dispositivo.
