# Demo Agent — remember → recall (via Context API MCP)

A tiny autonomous agent that proves the Context API works as **durable agent
memory**: it writes a learning, then recalls it as if in a later session.

## Run
```bash
cd agent
CONTEXT_MCP_URL=https://context-mcp.srv1461270.hstgr.cloud/mcp \
CONTEXT_API_KEY=eos_YOUR_KEY \
node agent.mjs
```

## What it does
1. `createLearning` — write a note to memory.
2. `listLearnings` — recall memory (fresh call, no local state).
3. Asserts the written note is present → **round-trip PASS**.

No SDK required — `mcp-client.mjs` speaks JSON-RPC over the Streamable-HTTP
transport directly. Everything is scoped to your `eos_` key's workspace.
