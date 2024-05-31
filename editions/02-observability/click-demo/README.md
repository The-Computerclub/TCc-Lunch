## click-demo

Observable clicks

## Setting up

First install everything with `npm install`, then generate the api code via `npm run generate`. Now you can build everything via `npm run build --workspaces`.

## Running

Make sure you have docker running! Then run `docker-compose up --wait` to start all dependency services. Then start the server via `npm --workspace click-demo-server start`.

Then go to `http://localhost:8080` and click away! Zipkin (traces) is at `http://localhost:9411` and Prometheus (metrics) is at `http://localhost:9090`.


Try this in prometheus: `increase(color_count_total[1m])`.
\o/
