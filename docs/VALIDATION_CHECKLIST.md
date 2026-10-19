# Checklist de validación — Fix build staging: fuentes autoalojadas (2026-10-19)

> Este fichero se sobrescribe en cada entrega. El historial queda en Git.

**Repositorio:** `anclora-advisor-ai`
**Rama y commit:** development (commit del fix sobre `9421122`)
**Entorno de validación:** build local + despliegue de Vercel en `staging`
**Datos:** ninguno; no hay cambios de datos ni de esquema.

## 1. Qué cambia
- `src/app/layout.tsx` usa `next/font/local` en lugar de `next/font/google` para Inter y JetBrains Mono.
- Se añaden `src/app/fonts/Inter-latin.woff2` y `src/app/fonts/JetBrainsMono-latin.woff2` (subset latin, variables).
- Motivo: el build de Vercel en staging fallaba con `TypeError: Cannot read properties of null (reading '1')` en el loader de `next/font/google` (fallo al descargar fuentes). El build ya no depende de la red de Google Fonts.

## 2. Ya comprobado por el agente
| Comprobación | Comando o método | Resultado | SHA |
| --- | --- | --- | --- |
| Build de producción | `npx next build` | PASS — compila y genera 39/39 páginas | árbol de trabajo sobre `9421122` |

## 3. Pruebas no ejecutadas (NOT_RUN)
| Prueba | Motivo concreto |
| --- | --- |
| Lint, typecheck, tests | Cambio limitado a carga de fuentes; el build cubre compilación y tipos. |
| QA visual con agent-browser | Se deja a la revisión visual directa de Toni (FAST UI). |

## 4. Checklist para validar en la aplicación
| # | Dónde | Pasos | Resultado esperado | Cuenta o configuración | Bloqueante |
| --- | --- | --- | --- | --- | --- |
| 1 | Despliegue Vercel de `staging` | Comprobar que el build termina en estado Ready | Sin error de `next/font` | — | Sí |
| 2 | `/login` y `/dashboard` en staging | Abrir y observar la tipografía | Texto en Inter; datos/código en JetBrains Mono, sin cambio visual respecto a antes | Cuenta QA persistente | Sí |

### Casos negativos y de borde
| # | Caso | Resultado esperado |
| --- | --- | --- |
| 1 | Caracteres con tilde, ñ y ç | Se renderizan con la fuente (están en el subset latin) |

### Estados de interfaz afectados
- [ ] Móvil · [ ] Escritorio · [ ] Modo oscuro (marca los que revises)

## 5. Riesgos y limitaciones
- Solo se incluye el subset latin; alfabetos cirílico, griego o vietnamita caerían a la fuente de reserva (la app es ES/CA/EN, no los usa).

## 6. Decisión de Toni
- [ ] Todos los puntos bloqueantes pasan
- [ ] Se promociona: escribir `PROMOTE=FULL` (staging → production → main)
- [ ] No se promociona. Motivo: ______________________
