# Cutover runtime — Anclora Advisor AI

**Rama:** `development`
**Estado del código:** preparado localmente y pendiente de validación del usuario.
**Runtime objetivo:** Vercel, Neon PostgreSQL/Neon Data API, Anclora Identity y Vercel Blob.

## Implementado en este cambio

- La aplicación, sus rutas API y scripts operativos usan Neon.
- La autenticación de la aplicación usa OIDC y sesiones de Anclora Identity.
- Los objetos de aplicación se gestionan mediante Vercel Blob.
- Los scripts SQL viven en `neon/migrations/`; se añadió una migración para actualizar políticas y claims existentes.
- Se quitaron los clientes y credenciales de proveedores anteriores del runtime y del ejemplo de entorno.

## Validación y límites

- `npm run -s type-check`: pasó tras regenerar los tipos de Next.js y retirar artefactos obsoletos.
- `npm run -s lint`: pasó.
- `npm run -s test:smoke`: pasó.
- `npm run -s test:integration:ops`: pasó.
- `npm test`: pasó.
- `npm run -s build`: pasó.
- Las pruebas UI E2E con sesión real no se ejecutaron porque no están configuradas las credenciales de QA/sesión requeridas en este entorno.
- No se aplicó ninguna migración remota ni se desplegó el código.
- Los documentos históricos pueden describir proveedores previos; no son configuración activa. La carpeta de migraciones Supabase y los módulos cliente de Supabase ya no están en el árbol de trabajo.
- `@supabase/postgrest-js` aparece como dependencia transitiva de `@neondatabase/postgrest-js`, el cliente oficial de Neon Data API compatible con PostgREST. Esto no configura ni establece conexión con Supabase.

## Siguiente validación

- Revisar el flujo local de inicio, callback y cierre de sesión de Identity con la cuenta QA dedicada.
- Validar operaciones de base de datos y archivos contra las integraciones configuradas.
- Aplicar la migración Neon según el proceso gobernado y comprobar el esquema/políticas antes del despliegue.
- Validar el build y el deployment de Vercel; mantener cambios sin commit hasta la validación de Toni.
