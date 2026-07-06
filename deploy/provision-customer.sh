#!/usr/bin/env bash
# Onboard a paying customer: creates an isolated workspace + eos_ key via the supported API.
# Usage: provision-customer.sh "Customer Name"
set -euo pipefail
NAME="${1:-}"
[ -z "$NAME" ] && { echo 'Usage: provision-customer.sh "Customer Name"'; exit 1; }

ADMIN=$(docker exec context-api-api-1 printenv ADMIN_SECRET)
RESP=$(curl -s -X POST http://127.0.0.1:8080/api/workspaces \
  -H "Content-Type: application/json" \
  -H "X-Admin-Secret: $ADMIN" \
  -d "{\"name\":\"$NAME\"}")

KEY=$(printf '%s' "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin)["apiKey"])' 2>/dev/null || true)
if [ -z "$KEY" ]; then echo "Provisioning failed:"; echo "$RESP"; exit 1; fi
WID=$(printf '%s' "$RESP" | python3 -c 'import sys,json;print(json.load(sys.stdin)["workspace"]["id"])')

cat <<OUT

================ CUSTOMER PROVISIONED ================
Customer:      $NAME
Workspace ID:  $WID
API key:       $KEY   <-- send to customer ONCE (only hash is stored server-side)

MCP endpoint:  https://context-mcp.srv1461270.hstgr.cloud/mcp
Client header: Authorization: Bearer $KEY
=====================================================
OUT
