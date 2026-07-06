# Documentation — Context API MCP

Start here.

| Doc | For |
|---|---|
| [README](../README.md) | What this is + quick start |
| [architecture.md](architecture.md) | How the pieces fit, design decisions, failure modes |
| [connect-guide.md](connect-guide.md) | Connect Claude / Cursor / any MCP client |
| [PRD.md](PRD.md) | Product requirements & success metrics |
| [../CHANGELOG.md](../CHANGELOG.md) | Version history |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Dev loop & PR rules |

## The 30-second mental model
Context API = structured, per-tenant **memory** for editorial agents.
This repo wraps it as **39 MCP tools** over **HTTPS**, with each
customer's `eos_` key scoping every call to their own workspace.

## Live
- MCP: `https://context-mcp.srv1461270.hstgr.cloud/mcp`
- API: `https://context-api.srv1461270.hstgr.cloud/api`
