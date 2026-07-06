// Demo agent — "remember, then recall" via the Context API MCP.
//
// Shows the core value of the Context API as agent memory:
//   1. Record a learning (durable memory write)
//   2. List learnings (recall on a later "session")
//   3. Confirm the learning we wrote is present
//
// Memory is scoped by the 'product' field, so pass a stable product name.
//
// Usage:
//   CONTEXT_MCP_URL=https://context-mcp.srv1461270.hstgr.cloud/mcp \
//   CONTEXT_API_KEY=eos_... \
//   node agent.mjs
const URL = process.env.CONTEXT_MCP_URL || "https://context-mcp.srv1461270.hstgr.cloud/mcp";
const KEY = process.env.CONTEXT_API_KEY;
const PRODUCT = process.env.CONTEXT_PRODUCT || "editorial-demo";
if (!KEY) { console.error("Set CONTEXT_API_KEY (an eos_ key)."); process.exit(1); }

const marker = "demo-learning-" + Date.now();
const learning = {
  product: PRODUCT,
  category: "headlines",
  title: "Demo agent memory check",
  body: "Example learning written by the demo agent to show durable memory. (" + marker + ")",
  confidence: "medium",
};

async function main() {
  console.log("Tools available:", (await listTools(URL, KEY)).length);

  console.log("\n[1] Writing a learning to memory…");
  console.log(await callTool(URL, KEY, "createLearning", { body: learning }));

  console.log("\n[2] Recalling learnings (new session, scoped by product)…");
  const recalled = await callTool(URL, KEY, "listLearnings", { query: { product: PRODUCT } });
  console.log(recalled);

  console.log("\n[3] Round-trip check:",
    recalled.includes(marker) ? "PASS — memory persisted ✅" : "marker not found (check schema)");
}
main().catch(e => { console.error(e); process.exit(1); });
