import * as opentelemetry from "@opentelemetry/api";
import * as api from "click-demo-api";
import fs from "fs/promises";
import * as oa42otel from "oa42-opentelemetry";
import path from "path";
import { projectRoot } from "../root.js";
import { withPgClient } from "../utils/pg-client.js";

export interface ServerAuthentication {
  apiToken: { id: number };
}

export type Server = api.Server<ServerAuthentication>;

export function createApplicationServer() {
  const server = new api.Server<ServerAuthentication>();

  // telemetry

  oa42otel.instrument(server);

  const colorCounter = opentelemetry.metrics
    .getMeter("server")
    .createCounter("color_count");

  // authentication

  server.registerApiTokenAuthentication(async (token) => {
    const result = await withPgClient(async (client) =>
      client.query(
        `
          select id
          from tokens
          where value = $1
          ;
        `,
        [token]
      )
    );

    if (result.rows.length !== 1) {
      return;
    }

    const [row] = result.rows;
    const id = row.id as number;

    return { id };
  });

  // operations!

  server.registerClickOperation(async (incomingRequest) => {
    const { color } = incomingRequest.parameters;

    const result = await withPgClient(async (client) =>
      client.query(
        `
          insert into colors(value)
          values($1)
          ;
        `,
        [color]
      )
    );
    colorCounter.add(1, { color });

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
      const response = await next(request);
      return response;
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
      const response = await next(request);
      return response;
    }

    return {
      status: 200,
      headers: {
        "content-type": "application/javascript",
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
