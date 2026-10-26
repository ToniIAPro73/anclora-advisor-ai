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
| Flujo autenticado contra Neon y JWT ES256 de servicio | Pendiente de publicar esta revisión, configurar los secretos necesarios y actualizar el JWKS externo de Neon. |
| Revisión visual y smoke de Preview | Pendiente de Toni en el entorno publicado. |

## 4. Checklist para Toni

| # | Dónde | Pasos | Resultado esperado | Bloqueante |
| --- | --- | --- | --- | --- |
| 1 | development | Revisar la separación de base de datos, Auth y Storage, y el endpoint JWKS | Supabase sigue siendo el proveedor activo por defecto; no hay secretos en el repo | Sí |
| 2 | Preview | Revisar la Preview correspondiente al SHA de este push | La aplicación inicia y el endpoint `/.well-known/jwks.json` devuelve claves públicas | Sí, antes de configurar Neon en la aplicación |
| 3 | Neon/Vercel | Configurar `NEON_DATA_API_URL`, `NEON_SERVICE_JWT_PRIVATE_KEY` y actualizar el JWKS externo de Neon al endpoint desplegado | El JWT de Supabase Auth y el JWT ES256 de servicio son aceptados antes de cambiar `DATABASE_PROVIDER` | Sí, antes del cutover |
| 4 | Preview | Activar `DATABASE_PROVIDER=neon` y revisar flujos de lectura, escritura, Auth y Storage con la identidad QA dedicada | Los datos se leen/escriben en Neon; Auth y Storage continúan en Supabase | Sí |

## 5. Riesgos y limitaciones

- `DATABASE_PROVIDER` sigue usando `supabase` por defecto; el push por sí solo no cambia el tráfico.
- Neon Data API está configurada actualmente con el JWKS de Supabase Auth. Para validar el JWT de servicio ES256 se debe cambiar el proveedor JWKS a `https://<dominio-produccion>/.well-known/jwks.json` después del despliegue.
- No se deben borrar los roles `advisor_legacy_*`: contienen los grants importados que heredan los roles de Neon Data API.
- El flujo autenticado de extremo a extremo aún no se ha probado.

## 6. Decisión de Toni

- [ ] Validado en development
- [ ] Validado en Preview
- [ ] PROMOTE=FULL
- [ ] No se promociona. Motivo: ______________________
