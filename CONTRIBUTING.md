# Contributing

Thanks for helping improve the **Context API MCP**.

## Ground rules
- Never commit secrets. `.env` is gitignored; use `.env.example` as the template.
- Keep the MCP server spec-driven — tools are generated from the Context API's
  OpenAPI spec, so new endpoints appear on restart without code edits.
- Preserve multi-tenancy: the server must forward each client's bearer token
  and must never fall back to a shared token in production.

## Dev loop
1. Edit `deploy/server.js`.
2. `cd deploy && docker compose up -d --build`.
3. Run `node evals/run-evals.mjs` against a test key.

## PRs
- One logical change per PR. Update `CHANGELOG.md` and bump `VERSION` when behavior changes.
