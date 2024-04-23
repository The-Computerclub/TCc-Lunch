import * as api from "click-demo-api";
import fs from "fs/promises";
import { second } from "msecs";
import path from "path";
import * as timers from "timers/promises";
import { projectRoot } from "../root.js";

export type Server = api.Server<{}>;

export function createApplicationServer() {
  const server = new api.Server<{}>();

  // operations!

  server.registerClickOperation(async (incomingRequest) => {
    const { color } = incomingRequest.parameters;

    switch (color) {
      case "red":
        await timers.setTimeout(1 * second);
        break;

      case "green":
        break;

      case "blue":
        await timers.setTimeout(0.5 * second);
        break;

      case "yellow":
        await timers.setImmediate();
        break;
    }

    return {
      parameters: {},
      status: 204,
      contentType: null,
    };
  });

  // middleware!

  server.registerMiddleware(api.createErrorMiddleware());

  // serve a static file
  server.registerMiddleware(async (request, next) => {
    if (request.path !== "/") {
      return next(request);
    }

    return {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
      async *stream() {
        const data = await fs.readFile(
          path.join(projectRoot, "assets", "index.html")
        );
        yield data;
      },
    };
  });

  // serve a static file
  server.registerMiddleware(async (request, next) => {
    if (request.path !== "/browser.js") {
      return next(request);
    }

    return {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
      async *stream() {
        const data = await fs.readFile(
          path.join(projectRoot, "bundled", "browser.js")
        );
        yield data;
      },
    };
  });

  return server;
}
