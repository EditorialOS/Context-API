import express from "express";
import * as mcpMod from "@modelcontextprotocol/sdk/server/mcp.js";
import * as httpMod from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as zodMod from "zod";
import * as yamlMod from "yaml";

const z = zodMod.z || zodMod.default || zodMod;
const YAML = yamlMod.default || yamlMod;
const McpServer = mcpMod.McpServer;
const StreamableHTTPServerTransport = httpMod.StreamableHTTPServerTransport;

const API_BASE = (process.env.CONTEXT_API_BASE_URL || "http://api:8080/api").replace(/\/$/, "");
const PORT = process.env.PORT || 3000;
// Optional: allow a server-side fallback token ONLY if explicitly enabled (demo mode).
const ALLOW_FALLBACK = process.env.ALLOW_FALLBACK_TOKEN === "1";
const FALLBACK_TOKEN = process.env.CONTEXT_API_TOKEN || "";
const SKIP = new Set(["getDocsUi", "getOpenApiSpec"]);

let SPEC = null;
async function loadSpec() {
  if (SPEC) return SPEC;
  const res = await fetch(API_BASE + "/openapi.yaml");
  if (!res.ok) throw new Error("spec fetch failed: " + res.status);
  SPEC = YAML.parse(await res.text());
  return SPEC;
}
function pathParamNames(p){ const o=[]; const re=/\{([^}]+)\}/g; let m; while((m=re.exec(p)))o.push(m[1]); return o; }

// Build a request-scoped MCP server bound to ONE customer's bearer token.
async function makeServer(token) {
  const spec = await loadSpec();
  const server = new McpServer({ name: "context-api-mcp", version: "1.1.0" });
  const methods = ["get","post","put","patch","delete"];
  for (const [path, item] of Object.entries(spec.paths || {})) {
    for (const method of methods) {
      const op = item[method]; if (!op) continue;
      const opId = op.operationId || (method + path.replace(/[^a-z0-9]+/gi,"_"));
      if (SKIP.has(opId)) continue;
      const pnames = pathParamNames(path);
      const hasBody = ["post","put","patch"].includes(method);
      const shape = {};
      for (const pn of pnames) shape[pn] = z.string().describe("Path parameter: " + pn);
      shape.query = z.record(z.any()).optional().describe("Query string parameters");
      if (hasBody) shape.body = z.record(z.any()).optional().describe("JSON request body");
      const desc = (op.summary || op.description || (method.toUpperCase()+" "+path)).slice(0,300);
      server.tool(opId, desc, shape, async (args) => {
        try {
          let url = path;
          for (const pn of pnames) url = url.replace("{"+pn+"}", encodeURIComponent(args[pn] ?? ""));
          const qs = new URLSearchParams();
          if (args.query) for (const [k,v] of Object.entries(args.query)) qs.append(k, String(v));
          const full = API_BASE + url + (qs.toString() ? "?"+qs.toString() : "");
          const headers = { "Content-Type": "application/json" };
          if (token) headers["Authorization"] = "Bearer " + token;
          const init = { method: method.toUpperCase(), headers };
          if (hasBody && args.body !== undefined) init.body = JSON.stringify(args.body);
          const res = await fetch(full, init);
          const text = await res.text();
          return { content: [{ type: "text", text: "HTTP " + res.status + "\n" + text }], isError: !res.ok };
        } catch (e) {
          return { content: [{ type: "text", text: "Error: " + (e?.message || String(e)) }], isError: true };
        }
      });
    }
  }
  return server;
}

const app = express();
app.use(express.json({ limit: "4mb" }));
app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

function bearerFrom(req){
  const h = req.headers["authorization"] || req.headers["Authorization"];
  if (h && /^Bearer\s+/i.test(h)) return h.replace(/^Bearer\s+/i, "").trim();
  // also accept X-Api-Key for convenience
  if (req.headers["x-api-key"]) return String(req.headers["x-api-key"]).trim();
  return null;
}

app.post("/mcp", async (req, res) => {
  try {
    let token = bearerFrom(req);
    if (!token && ALLOW_FALLBACK) token = FALLBACK_TOKEN;
    if (!token) {
      return res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "Unauthorized: provide your Context API key via 'Authorization: Bearer eos_...'" }, id: null });
    }
    const server = await makeServer(token);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => { transport.close(); server.close?.(); });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: String(e?.message || e) }, id: null });
  }
});
const notAllowed = (_req,res)=>res.status(405).json({ jsonrpc:"2.0", error:{ code:-32000, message:"Method not allowed. Use POST." }, id:null });
app.get("/mcp", notAllowed); app.delete("/mcp", notAllowed);

app.listen(PORT, () => console.log("Context API MCP (multi-tenant) listening on :" + PORT + " — fallback=" + ALLOW_FALLBACK));
