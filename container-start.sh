#!/usr/bin/env bash
# Container entrypoint: starts MongoDB, waits for it, then starts the API.
# If either process dies, the other is stopped and the container exits (compose restarts it).
# On `docker compose stop/down` both shut down cleanly (API first, then MongoDB).
set -uo pipefail

# Loopback only: with network_mode host this is the VPS's 127.0.0.1, never the internet
mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017 --quiet &
mongo_pid=$!

for _ in $(seq 1 60); do
    mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok' > /dev/null 2>&1 && break
    kill -0 "$mongo_pid" 2> /dev/null || { echo "mongod exited during startup" >&2; exit 1; }
    sleep 1
done

node dist/server.js &
node_pid=$!

shutdown() {
    kill -TERM "$node_pid" 2> /dev/null && wait "$node_pid"
    kill -TERM "$mongo_pid" 2> /dev/null && wait "$mongo_pid"
}
trap 'shutdown; exit 0' TERM INT

wait -n "$node_pid" "$mongo_pid"
status=$?
echo "A process exited (status $status), stopping the container" >&2
shutdown
exit "$status"
