# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.0.0] - 2026-07-06
### Added
- Multi-tenant MCP server over HTTPS for the Editorial OS **Context API**.
- Auto-generated MCP tools (one per OpenAPI operation) — **39 tools** at launch.
- Per-request bearer pass-through auth → strict per-workspace tenant isolation.
- Traefik + Let's Encrypt TLS at `context-mcp.srv1461270.hstgr.cloud`.
- One-command customer onboarding (`provision-customer.sh`).
- Eval harness and demo agent (store → recall round-trip).
- CI workflow, architecture & connect docs, PRD.
