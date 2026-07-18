#!/usr/bin/env bash
# Free Next.js dev ports on Windows (Git Bash). Safe to re-run.

PORTS=(3000 3001 3002)

for port in "${PORTS[@]}"; do
  pids=$(netstat -ano | grep -E ":$port[[:space:]]" | grep LISTENING | awk '{print $5}' | sort -u)
  if [ -z "$pids" ]; then
    echo "Port $port: already free"
    continue
  fi
  for pid in $pids; do
    if [ -n "$pid" ] && [ "$pid" != "0" ]; then
      echo "Killing PID $pid (port $port)"
      taskkill //PID "$pid" //F 2>/dev/null || true
    fi
  done
done

echo "Done."
for port in "${PORTS[@]}"; do
  netstat -ano | grep -E ":$port[[:space:]]" | grep LISTENING || echo "Port $port: free"
done
