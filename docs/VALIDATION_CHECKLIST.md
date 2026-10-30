# Checklist de validación — CI: shim de `server-only` compatible con Node 22.23 (2026-10-30)

> Se sobrescribe en cada entrega; el historial queda en Git.

**Repositorio:** anclora-advisor-ai
**Rama:** development
**Datos:** no se usaron ni modificaron datos de aplicación.

## 1. Qué cambia
- `tests/server-only-test-shim.cjs`: el paquete `server-only` se resuelve parcheando la resolución CJS en lugar de `Module.registerHooks`. Con `--import=tsx` el hook síncrono rompía en Node 22.23.x (`ERR_METHOD_NOT_IMPLEMENTED: resolveSync`), lo que dejaba rojo el paso "Smoke tests" del CI desde `d561215`.
- Solo infraestructura de tests; sin cambios de código de producto, dependencias ni workflow.

## 2. Ya comprobado por el agente
| Comprobación | Resultado |
| --- | --- |
| Reproducido el fallo con Node 22.23.4 (el del CI); tras el arreglo `test:smoke` y `test:integration:ops` pasan con Node 22.23.4 y 24.19 | PASS |
| Otros tests con el mismo shim (contract-compliance, legal-document-rules, validate-contract-route, i18n) en Node 22.23.4 | PASS |
| `type-check`, `lint`, `git diff --check` | PASS |

## 3. NOT_RUN
`e2e-ui` (Playwright): ya estaba en verde en el CI y no depende del shim.

## 4. Para Toni
Comprobar que el CI de `development` queda en verde. Bloqueante: no.
