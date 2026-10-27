const Module = require("node:module");
const emptyModule = require.resolve("./server-only-empty.cjs");
Module.registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") return { url: `file://${emptyModule}`, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
