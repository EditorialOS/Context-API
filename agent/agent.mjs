// Demo agent — "remember, then recall" via the Context API MCP.
//
// Shows the core value of the Context API as agent memory:
//   1. Record a learning (durable memory write)
//   2. List learnings (recall on a later "session")
//   3. Confirm the learning we wrote is present
//
// Usage:
//   CONTEXT_MCP_URL=https://context-mcp.srv1461270.hstgr.cloud/mcp \
//   CONTEXT_API_KEY=eos_... \
//   node agent.mjs
const URL = process.env.CONTEXT_MCP_URL || "https://context-mcp.srv1461270.hstgr.cloud/mcp";
const KEY = process.env.CONTEXT_API_KEY;
if (!KEY) { console.error("Set CONTEXT_API_KEY (an eos_ key)."); process.exit(1); }

const note = "Headlines with a number in the first 3 words outperformed by ~18% (demo learning " + Date.now() + ")";

async function main() {
  console.log("Tools available:", (await listTools(URL, KEY)).length);

  console.log("\n[1] Writing a learning to memory…");
  console.log(await callTool(URL, KEY, "createLearning", { body: { note, category: "headlines" } }));

  console.log("\n[2] Recalling learnings (new session)…");
  const recalled = await callTool(URL, KEY, "listLearnings", {});
  console.log(recalled);

  console.log("\n[3] Round-trip check:",
    recalled.includes(note.slice(0, 24)) ? "PASS — memory persisted ✅" : "note not found (check schema)");
}
main().catch(e => { console.error(e); process.exit(1); });
