# Eval Harness — Context API MCP

A scored regression harness that verifies the Context API behaves as reliable,
**isolated** agent memory.

## Run
```bash
cd evals
CONTEXT_MCP_URL=https://context-mcp.srv1461270.hstgr.cloud/mcp \
CONTEXT_API_KEY=eos_YOUR_KEY \
node run-evals.mjs
```

## What it checks
- **Identity** — `getCurrentWorkspace` returns your workspace.
- **Round-trip memory** — write a learning, then recall it (`EVAL_MARKER`).
- **Domain reads** — brand context, destinations, audit log respond.
- **Isolation** — an unauthenticated call is rejected with 401.

Exit code is non-zero if any case fails, so it drops straight into CI.
Cases live in `dataset.json`; add rows to extend coverage.
