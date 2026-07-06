# Product Requirements Document — Context API MCP

| | |
|---|---|
| **Product** | Context API — agent memory & brand context, via MCP |
| **Version** | 1.0.0 |
| **Status** | Live |
| **Updated** | 2026-07-06 |

## 1. Problem
AI agents are stateless. Editorial teams need agents that remember brand voice,
destinations, reusable assets, prior learnings, and quality baselines across
sessions — without leaking one customer's memory into another's.

## 2. Goals
- Expose the Context API to any MCP client with **zero per-tool maintenance**.
- Enforce **strict multi-tenant isolation** end to end.
- Ship over **HTTPS** with automatic certs.
- Onboard a paying customer in **one command**.

## 3. Non-goals
- Building a UI. (Clients are Claude/Cursor/agents.)
- Reimplementing business logic already in the Context API.
- Billing/metering (tracked as a hardening gap).

## 4. Users
- **Editorial teams** — durable, structured memory for their agents.
- **Agent developers** — a tool surface they can call without bespoke glue.
- **Operator (you)** — provision, isolate, and revoke customers quickly.

## 5. Requirements
### Functional
- One MCP tool per Context API operation (39 tools), generated from OpenAPI.
- Per-request bearer pass-through; reject unauthenticated calls with 401.
- Streamable-HTTP transport at POST `/mcp`; health at `/healthz`.
- Onboarding script mints workspace + key via the API (never raw SQL).

### Non-functional
- TLS via Traefik + Let's Encrypt (auto-renew).
- Stateless MCP layer; all persistence in the Context API's Postgres.
- Restart picks up new API endpoints automatically.

## 6. Success metrics
- 100% of API operations exposed as tools (currently 39/39).
- Isolation tests pass: own-key→200, missing/bogus→401, cross-tenant→never.
- New customer live in < 1 minute.

## 7. Hardening backlog
- Per-key rate limits / quotas (Redis available).
- Usage metering + billing (Stripe).
- Self-serve key rotation & revocation portal.
- Uptime monitoring + alerting on `/healthz` and restart loops.
