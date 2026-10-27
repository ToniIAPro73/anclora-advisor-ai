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

---

# Checklist de validación — integración de Advisor AI con Anclora Identity (2026-10-27)

**Repositorio:** anclora-advisor-ai
**Rama:** development
**Alcance:** añadir el flujo OIDC y sesión de Anclora Identity en Advisor AI, centralizar allí los roles de aplicación y registrar el estado real de Neon sin declarar un corte de producción.
**Producción:** no modificada; el proveedor efectivo de datos y autenticación sigue siendo Supabase hasta una promoción y configuración explícitas.

## Cambios incluidos

- Rutas de inicio/callback OIDC, validación de sesión Identity y cierre de sesión en Advisor.
- Resolución de identidad de aplicación y token Neon de usuario, con Identity desactivado por defecto.
- Script de planificación/aplicación de roles Advisor administrados desde Identity; la migración no se ejecuta por este commit.
- Contratos y SDD distinguen Supabase efectivo en Producción de Neon/Identity como cambios pendientes.

## Validación de este lote

| Comprobación | Resultado |
| --- | --- |
| `git diff --cached --check` | PASS |
| Pruebas, type-check y build ejecutados en esta intervención | No ejecutados |
| Revisión y autorización de Toni para commit/push a `development` | Confirmadas en esta conversación |

## Pendiente antes de activar o promocionar

- Verificar el flujo OIDC con una cuenta QA dedicada en el entorno autorizado.
- Configurar y validar Neon Data API/JWKS y los selectores de proveedor antes de habilitar Identity en el runtime.
- Ejecutar la migración de roles sólo en el entorno aprobado y comprobar la asignación existente antes de activarla.
- Mantener Supabase como proveedor de producción hasta completar el corte y la revisión explícita.
