# Checklist de validación — Supabase Storage a Vercel Blob (2026-10-27)

**Repositorio:** anclora-advisor-ai
**Rama:** development
**Alcance:** preparar el almacenamiento privado con Vercel Blob para evidencias laborales e importaciones de facturas.
**Producción:** no modificada; `ADVISOR_STORAGE_PROVIDER` continúa usando Supabase por defecto.

## Cambios incluidos

- Añade un adaptador server-side para Vercel Blob privado con fallback explícito a Supabase Storage.
- Enruta la subida, descarga autorizada y eliminación de evidencias laborales por el adaptador.
- Enruta la subida de PDF de facturas y la compensación por fallo por el adaptador.
- Documenta variables de entorno sin incluir valores secretos.
- Añade especificación, plan, tareas y runbook para el corte gradual.

## Estado de datos

- El inventario de Supabase encontró 3 objetos `labor-evidence` (306 bytes) sin referencias activas y 0 objetos de importación de facturas.
- No se copiaron objetos: los tres archivos sin referencias se conservan en Supabase como archivo.
- No se modificaron registros de aplicación ni se cambió el proveedor activo.

## Validación realizada

| Comprobación | Resultado |
| --- | --- |
| `npm run type-check` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| Escaneo de patrones de secretos en archivos preparados | PASS; sin credenciales detectadas |

## Pendiente de revisión de Toni

| # | Dónde | Validación | Resultado esperado | Bloqueante |
| --- | --- | --- | --- | --- |
| 1 | `development` | Revisar el adaptador y las rutas de evidencias e importación PDF | Supabase sigue siendo el proveedor por defecto y no aparecen secretos | Sí |
| 2 | Vercel Preview | Configurar `ADVISOR_STORAGE_PROVIDER=vercel_blob` solo en Preview; probar subida, descarga y borrado con `qa.advisor@anclora.local`, además de importación PDF | Las operaciones permitidas funcionan en Blob privado; Auth y datos permanecen sin cambios | Sí, antes del corte |
| 3 | Vercel Production | Mantener Supabase hasta completar la revisión de Preview y autorizar por separado el corte | Producción sigue operando con el proveedor actual | Sí |

## Decisión de Toni

- [ ] Validado en development
- [ ] Validado en Preview
- [ ] Autorizar corte de producción
- [ ] No se promociona. Motivo: ______________________
