#!/usr/bin/env node

import cp from "child_process";
import path from "path";

const projectRoot = path.resolve(import.meta.dirname, "..");

const options = { shell: true, stdio: "inherit", env: process.env };

cp.execFileSync("tsc", ["--project", path.resolve(projectRoot, "tsconfig.json")], options);

cp.execFileSync("rollup", ["--config", path.resolve(projectRoot, "rollup.config.js")], options);
