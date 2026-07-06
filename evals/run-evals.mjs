// Eval harness — store → recall → isolation for the Context API MCP.
// Usage:
//   CONTEXT_MCP_URL=https://context-mcp.srv1461270.hstgr.cloud/mcp CONTEXT_API_KEY=eos_... node run-evals.mjs
const URL = process.env.CONTEXT_MCP_URL || "https://context-mcp.srv1461270.hstgr.cloud/mcp";
const KEY = process.env.CONTEXT_API_KEY;
if (!KEY) { console.error("Set CONTEXT_API_KEY"); process.exit(1); }

const cases = JSON.parse(await readFile(new URL("./dataset.json", import.meta.url)));
let pass = 0;

for (const c of cases) {
  let out;
  try { out = await callTool(URL, KEY, c.tool, c.args); }
  catch (e) { out = "ERR " + e.message; }
  const ok = String(out).includes(c.check);
  if (ok) pass++;
  console.log((ok ? "PASS" : "FAIL").padEnd(5), c.id.padEnd(22), "— " + c.expect);
  if (!ok) console.log("        got:", String(out).slice(0, 120));
}

// Isolation check: no key => must be rejected
const res = await fetch(URL, {
  method: "POST",
  headers: { "Content-Type": "application/json", "Accept": "application/json, text/event-stream" },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "getCurrentWorkspace", arguments: {} } }),
});
const isoOk = res.status === 401;
if (isoOk) pass++;
console.log((isoOk ? "PASS" : "FAIL").padEnd(5), "isolation-no-key".padEnd(22), "— unauthenticated call rejected (401)");

const total = cases.length + 1;
console.log("\n" + pass + "/" + total + " passed");
process.exit(pass === total ? 0 : 1);
