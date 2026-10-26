# Checklist de validación — Neon Data API para Advisor (2026-10-26)

> Cambios preparados en `development`. La base activa de la aplicación no cambia hasta completar la configuración de Vercel y desplegar esta revisión.

**Repositorio:** anclora-advisor-ai
**Rama:** development
**Entorno de validación:** desarrollo local; pendiente de revisión de Toni en Preview
**Datos:** no se modificaron filas de aplicación. Se configuraron los roles y la Neon Data API en la rama de producción de Neon.

## 1. Qué cambia

- Añade selección explícita `DATABASE_PROVIDER=supabase|neon` y `NEON_DATA_API_URL` para los clientes de datos.
- Conserva Supabase Auth y Supabase Storage independientemente del proveedor de base de datos.
- Añade firma de JWT de servicio ES256 y el endpoint JWKS que combina las claves públicas de Supabase Auth con la clave pública del servicio.
- Incluye `public/neon-jwks.json`, un JWKS público combinado que Neon puede leer desde GitHub sin acceder a la Preview protegida de Vercel.
- Separa las llamadas de Storage de las llamadas de base de datos en las rutas de evidencias laborales e importación de facturas.
- Neon Data API fue provisionada con JWT externo. Los roles importados se conservaron con nombres `advisor_legacy_*`; los roles de la API heredan sus grants. RLS sigue habilitado en las 18 tablas públicas.

## 2. Ya comprobado por el agente

| Comprobación | Comando o método | Resultado |
| --- | --- | --- |
| Chequeo de tipos | `npm run -s type-check` | PASS |
| Lint | `npm run -s lint` | PASS |
| Integridad del diff | `git diff --cached --check` | PASS |
| Neon Data API | Neon MCP, estado y configuración de rama | ACTIVE; esquema `public`, JWT role claim `.role` |
| RLS | Consulta de catálogos PostgreSQL | 18/18 tablas protegidas; 16 políticas conservadas |
| Acceso anónimo sin JWT | HTTP GET a `public.users` por Data API | Rechazado con HTTP 400 por falta de JWT |

## 3. Pruebas no ejecutadas (NOT_RUN)

| Prueba | Motivo concreto |
| --- | --- |
| Suite de tests, smoke e integración | No se ejecutaron localmente en esta tarea; CI se ejecutará tras el push. |
| Build de Next.js | No ejecutado localmente. |
| Flujo autenticado contra Neon y JWT ES256 de servicio | Pendiente de publicar esta revisión, actualizar el JWKS externo de Neon y activar Neon en Preview. |
| Revisión visual y smoke de Preview | Pendiente de Toni en el entorno publicado. |

## 4. Checklist para Toni

| # | Dónde | Pasos | Resultado esperado | Bloqueante |
| --- | --- | --- | --- | --- |
| 1 | development | Revisar la separación de base de datos, Auth y Storage, y el endpoint JWKS | Supabase sigue siendo el proveedor activo por defecto; no hay secretos en el repo | Sí |
| 2 | Preview | Revisar la Preview correspondiente al SHA de este push | La aplicación inicia y el endpoint `/.well-known/jwks.json` devuelve las claves públicas de Supabase Auth y del servicio | Sí, antes de configurar Neon en la aplicación |
| 3 | Neon/Vercel | Verificar las variables `NEON_DATA_API_URL` y `NEON_SERVICE_JWT_PRIVATE_KEY` en Preview/development. En Neon, configurar como JWKS URL `https://raw.githubusercontent.com/ToniIAPro73/anclora-advisor-ai/development/public/neon-jwks.json`, conservando audiencia `authenticated` y claim de rol `.role` | Neon puede descargar el JWKS público combinado; Vercel Production conserva sus variables y proveedor actuales | Sí, antes del cutover |
| 4 | Preview | Activar `DATABASE_PROVIDER=neon` solo para Preview/development y revisar flujos de lectura, escritura, Auth y Storage con la identidad QA dedicada | Los datos QA se leen/escriben en Neon; Auth y Storage continúan en Supabase | Sí |

## 5. Riesgos y limitaciones

- `DATABASE_PROVIDER` sigue usando `supabase` por defecto; el push por sí solo no cambia el tráfico.
- La Preview de Vercel está protegida; Neon no puede descargar el JWKS desde su URL de Preview. El JWKS combinado se publica como archivo estático en el repositorio público y Neon debe usar la URL `raw.githubusercontent.com` indicada arriba.
- `public/neon-jwks.json` contiene claves públicas, nunca claves privadas. Si Supabase rota sus claves de firma, hay que actualizar este archivo antes de retirar las claves antiguas del JWKS de Neon.
- La clave privada `NEON_SERVICE_JWT_PRIVATE_KEY` solo se configura en Vercel Preview durante esta fase. No activar `DATABASE_PROVIDER=neon` hasta que la URL pública del JWKS haya sido publicada y Neon la haya validado.
- No se deben borrar los roles `advisor_legacy_*`: contienen los grants importados que heredan los roles de Neon Data API.
- El flujo autenticado de extremo a extremo aún no se ha probado.

## 6. Decisión de Toni

- [ ] Validado en development
- [ ] Validado en Preview
- [ ] PROMOTE=FULL
- [ ] No se promociona. Motivo: ______________________
