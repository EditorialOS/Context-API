# Architecture — Context API MCP

_Last updated: 2026-07-06 · v1.0.0_

## Overview

The Context API is the durable memory layer for Editorial OS. This repo exposes
it to AI clients as a multi-tenant MCP server over HTTPS.

```
AI client (Claude / Cursor / agent)
   │  POST https://context-mcp.example.com/mcp
   │  Authorization: Bearer eos_<customer key>
   ▼
Traefik (host-networked, :443, Let's Encrypt TLS)
   │  Host(context-mcp.example.com) → container :3000
   ▼
context-api-mcp  (Node · express · @modelcontextprotocol/sdk)
   │  reads the client bearer per request, forwards it unchanged
   │  http://api:8080/api   (shared Docker network: context-api_default)
   ▼
context-api-api-1  (the Context API)
   ▼
context-api-postgres-1  (Postgres — stores only SHA-256 hashes of keys)
```

## Core design decisions

### 1. Bearer pass-through = multi-tenancy for free
The MCP server holds **no** shared secret in production
(`ALLOW_FALLBACK_TOKEN=0`). Every request must carry the customer's own
`Authorization: Bearer eos_...`. The server forwards that token to the Context
API, which already enforces per-workspace isolation. Result: customer A can
never see customer B's memory. Verified: valid key → own workspace; missing or
bogus key → 401.

### 2. Spec-driven tools = zero drift
On startup the server fetches `/api/openapi.yaml` and registers **one MCP tool
per operation** (39 tools). New endpoints appear on restart —
no code changes, no manual tool definitions to keep in sync.

### 3. Request-scoped MCP server
Each POST builds a short-lived MCP server bound to that request's token, wired to
a fresh `StreamableHTTPServerTransport`. The parsed spec is cached process-wide.

## Data domains (what memory looks like)

- **workspaces** (6): createWorkspace, getCurrentWorkspace, listApiKeys, createApiKey, revokeApiKey, archiveWorkspace
- **brand-context** (2): getBrandContext, upsertBrandContext
- **destinations** (4): listDestinations, createDestination, updateDestination, deleteDestination
- **assets** (5): listAssets, createAsset, updateAsset, deleteAsset, recordAssetUsage
- **queue** (5): listQueueItems, createQueueItem, getNextQueueItem, updateQueueItem, deleteQueueItem
- **batches** (5): listBatches, createBatch, getBatch, updateBatch, deleteBatch
- **performance** (3): listPerformance, createPerformance, deletePerformance
- **learnings** (4): listLearnings, createLearning, updateLearning, deleteLearning
- **baselines** (2): listBaselines, upsertBaseline
- **audit** (1): listAuditLog
- **export** (1): exportWorkspace

## Deployment topology

- **Traefik** terminates TLS and routes by hostname (Let's Encrypt, auto-renew).
- **context-api-mcp** joins `context-api_default` so it can reach the API by its
  Docker DNS name `api`.
- **Postgres** persists workspaces, keys (hashed), and all memory resources.

## Failure modes & handling

| Condition | Behavior |
|---|---|
| No / malformed bearer | `401` JSON-RPC error before any upstream call |
| Invalid key | Upstream `401` surfaced as tool `isError` |
| Upstream 4xx/5xx | Returned verbatim as `HTTP <code>\n<body>` |
| Spec fetch fails at boot | Server logs and retries on next request |
