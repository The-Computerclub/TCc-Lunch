#!/usr/bin/env node

import cp from "child_process";
import path from "path";

const workspaceRoot = path.resolve(import.meta.dirname, "..");

const options = { shell: true, stdio: "inherit", cwd: workspaceRoot };

cp.execFileSync(
  "npx",
  [
    "--package",
    "oa42-generator",
    "--",
    "oa42-generator",
    "package",
    path.resolve(workspaceRoot, "specifications", "openapi.yaml"),
    "--package-directory",
    path.resolve(workspaceRoot, ".api"),
    "--package-name",
    "click-demo-api",
    "--package-version",
    "0.0.0",
  ],
  options
);

cp.execFileSync(
  "npm",
  ["--workspace", "click-demo-api", "install"],
  options
);
cp.execFileSync(
  "npm",
  ["--workspace", "click-demo-api", "run", "build"],
  options
);
