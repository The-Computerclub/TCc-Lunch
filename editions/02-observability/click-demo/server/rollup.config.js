import replace from "@rollup/plugin-replace";
import path from "path";
import { defineConfig } from "rollup";

import { nodeResolve } from "@rollup/plugin-node-resolve";
const external = (id, parent, resolved) =>
  !(id.startsWith(".") || path.isAbsolute(id));

export default defineConfig([
  {
    input: path.resolve("transpiled", "browser.js"),
    output: {
      file: path.resolve("bundled", "browser.js"),
      format: "iife",
      sourcemap: true,
    },
    context: "global",
    plugins: [
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
        preventAssignment: true,
      }),
      nodeResolve(),
    ],
  },

  {
    external,
    input: path.resolve("transpiled", "program.js"),
    output: {
      file: path.resolve("bundled", "program.cjs"),
      // compile to commonjs to make all otel automatic instrumentation work
      format: "commonjs",
      sourcemap: true,
    },
    context: "global",
    plugins: [
      replace({
        values: {
          "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        },
        preventAssignment: true,
      }),
    ],
  },
]);
