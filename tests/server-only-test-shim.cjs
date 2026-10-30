const Module = require("node:module");
const emptyModule = require.resolve("./server-only-empty.cjs");

// `server-only` throws when imported outside a React Server Component bundle; tests run it as a plain module.
// Resolve it to an empty module by patching CJS resolution. `Module.registerHooks` is deliberately not used:
// combined with tsx's async loader (`--import=tsx`) it fails on Node 22.23+ with ERR_METHOD_NOT_IMPLEMENTED
// (resolveSync) as soon as the ESM loader resolves the test entry.
const resolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveServerOnly(request, ...rest) {
  if (request === "server-only") return emptyModule;
  return resolveFilename.call(this, request, ...rest);
};
