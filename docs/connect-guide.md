# How to Connect — Context API MCP (Customer Guide)

_Last updated: 2026-07-06 · v1.0.0_

You get an `eos_` key from your provider. It scopes every call to your own
workspace. Keep it secret — it is shown once.

## Endpoint
```
https://context-mcp.srv1461270.hstgr.cloud/mcp
```

## Claude Desktop / Cursor (native Streamable HTTP)
```json
{
  "mcpServers": {
    "context-api": {
      "url": "https://context-mcp.srv1461270.hstgr.cloud/mcp",
      "headers": { "Authorization": "Bearer eos_YOUR_KEY" }
    }
  }
}
```

## stdio-only clients (bridge with mcp-remote)
```json
{
  "mcpServers": {
    "context-api": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://context-mcp.srv1461270.hstgr.cloud/mcp",
               "--header", "Authorization: Bearer eos_YOUR_KEY"]
    }
  }
}
```

## Smoke test with curl
```bash
curl -s https://context-mcp.srv1461270.hstgr.cloud/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer eos_YOUR_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"getCurrentWorkspace","arguments":{}}}'
```
Expect `HTTP 200` and your workspace JSON.

## What you can do
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

## Troubleshooting
- **401** — missing/invalid key. Check the `Authorization` header.
- **Empty results** — a fresh workspace has no memory yet; write some via the
  `upsert*` / `create*` tools.
- **Tool not found** — run `tools/list`; the surface is generated from the live spec.
