# Kaanbal · Laboratorio de lógica

Demo independiente del tutor Python. React 19 + Vite 7, Three.js, React Three Fiber y Drei, con iconos de Lucide. Toma como referencias la composición de escena y controles flotantes de Marciano y WaterWiki.

## Desarrollo

Requiere Node.js 22.12 o superior y pnpm.

```sh
pnpm install
pnpm dev
```

Para producción: `pnpm build`. El sitio estático se genera en `dist/`.

## Experiencia

- Foco, cable y apagador modelados en Three.js, giro limitado de cámara.
- Control 3D y control HTML accesible con teclado para explorar encendido/apagado.
- Sonido generado con Web Audio al interactuar: clic, confirmación y pista; sin reproducción automática. Botón de silencio persistente por navegador.
- Predicción de un cambio, secuencia de tres cambios y transferencia a una regla invertida.
- El número y la justificación deben ser correctos. Los errores ofrecen una pista, sin avanzar.
- Animación secuencial, progreso durante la sesión, reinicio, ayuda modal y movimiento reducido.
- Versión móvil con desplazamiento vertical y versión de escritorio con escena completa.

## Límites

No usa IA ni llama a AWS. Las actividades tienen reglas deterministas y justificaciones de opción múltiple. No constituye una evaluación validada de dominio. El progreso vive en memoria y se reinicia al recargar; solo la preferencia de sonido se guarda localmente. No hay cuentas ni backend.
