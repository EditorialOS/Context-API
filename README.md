# Context API — Agent Memory & Brand Context (MCP Server)

<p align="center">
  <img alt="version" src="https://img.shields.io/badge/version-1.0.0-blue">
  <img alt="transport" src="https://img.shields.io/badge/MCP-streamable--http-6e40c9">
  <img alt="tools" src="https://img.shields.io/badge/tools-39-brightgreen">
  <img alt="tenancy" src="https://img.shields.io/badge/multi--tenant-yes-success">
  <img alt="tls" src="https://img.shields.io/badge/HTTPS-Let's%20Encrypt-orange">
</p>

The **Context API** is the memory and brand-context layer for the Editorial OS
platform. It stores what an editorial team knows — brand voice, publishing
destinations, reusable assets, a work queue, batch runs, performance signals,
learnings, and quality baselines — and lets AI agents **store and recall** that
knowledge across sessions.

This repository packages the Context API as a **multi-tenant MCP server over
HTTPS**, so any MCP-capable client (Claude Desktop, Cursor, an autonomous agent)
can use it as a live set of tools — with strict per-workspace isolation.

---

## Why this exists

Agents are stateless. The Context API gives them durable memory that is:

- **Per-tenant.** Each customer authenticates with their own `eos_` key and only
  ever sees their own workspace. Isolation is enforced by the API and preserved
  end-to-end by the MCP layer (bearer pass-through, no shared token).
- **Structured.** Not a blob store — typed resources (brand context, destinations,
  assets, learnings, baselines, audit log) with a real OpenAPI contract.
- **Zero-drift.** The MCP server generates one tool per API operation directly
  from the live OpenAPI spec, so the tool surface never falls out of sync.

## Deployment

| | |
|---|---|
| MCP (HTTPS) | `https://context-mcp.example.com/mcp` |
| API (HTTPS) | `https://context-api.example.com/api` |
| Transport | MCP Streamable HTTP (POST `/mcp`) |
| Auth | `Authorization: Bearer eos_<workspace key>` |
| Tools | **39**, auto-generated from OpenAPI |

## Tool surface (39 tools)

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

## Quick start (connect a client)

```json
{
  "mcpServers": {
    "context-api": {
      "url": "https://context-mcp.example.com/mcp",
      "headers": { "Authorization": "Bearer eos_YOUR_KEY" }
    }
  }
}
```

Full walkthrough → [docs/connect-guide.md](docs/connect-guide.md).

## Onboarding a customer

```bash
ssh <admin-user>@<your-server> /opt/context-api-mcp/provision-customer.sh "Customer Name"
```

Mints an isolated workspace + `eos_` key and prints the client config. Only the
key's SHA-256 hash is stored — the raw key is shown once.

## Repository layout

```
deploy/     MCP server, Dockerfile, compose, onboarding script, env template
docs/       architecture, connect guide, PRD, docs index
evals/      scored regression harness (store → recall → isolation)
agent/      demo agent: remember a learning, then recall it
```

## Documentation

- [docs/index.md](docs/index.md) — start here
- [docs/architecture.md](docs/architecture.md) — how it fits together
- [docs/connect-guide.md](docs/connect-guide.md) — connect any MCP client
- [docs/PRD.md](docs/PRD.md) — product requirements

## License

Proprietary — © 2026 EditorialOS. See [LICENSE](LICENSE).
