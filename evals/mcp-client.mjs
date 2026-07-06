// Minimal MCP Streamable-HTTP client — no SDK needed.
// Speaks JSON-RPC over POST /mcp and parses SSE responses.
export async function mcpCall(url, token, method, params) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "Authorization": "Bearer " + token,
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
  });
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (ct.includes("text/event-stream")) {
    // take the last data: line
    const line = text.split("\n").filter(l => l.startsWith("data:")).pop();
    return line ? JSON.parse(line.slice(5).trim()) : { httpStatus: res.status, raw: text };
  }
  try { return JSON.parse(text); } catch { return { httpStatus: res.status, raw: text }; }
}

export async function callTool(url, token, name, args = {}) {
  const r = await mcpCall(url, token, "tools/call", { name, arguments: args });
  return r.result?.content?.[0]?.text ?? JSON.stringify(r);
}

export async function listTools(url, token) {
  const r = await mcpCall(url, token, "tools/list", {});
  return (r.result?.tools || []).map(t => t.name);
}
