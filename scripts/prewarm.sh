#!/bin/bash
# Run this 5 minutes before a live demo
BACKEND=${1:-http://localhost:8004}
echo "Pre-warming EasyClaw..."
curl -s $BACKEND/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"Backend: {d['status']}\")"
curl -s $BACKEND/demos > /dev/null && echo "Demo guides: loaded"
curl -s $BACKEND/demo-stream/demo-restaurant -N --max-time 3 > /dev/null && echo "Demo stream: ready"
echo "EasyClaw is ready for demo."
