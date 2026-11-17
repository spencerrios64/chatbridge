// mcp-proxy.mjs - lets chatbridge (a web page) talk to a local stdio MCP server.
// Usage:  node mcp-proxy.mjs <port> <command> [args...]
// e.g.    node mcp-proxy.mjs 3939 npx -y @modelcontextprotocol/server-filesystem .
// Then in chatbridge connect to  http://localhost:3939/mcp   (no dependencies, Node 18+)
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import readline from 'node:readline';

const [port, cmd, ...args] = process.argv.slice(2);
if (!port || !cmd) { console.error('usage: node mcp-proxy.mjs <port> <command> [args...]'); process.exit(1); }

const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'inherit'], shell: process.platform === 'win32' });
child.on('exit', (c) => { console.error('MCP server exited', c); process.exit(c || 0); });
const pending = new Map();
readline.createInterface({ input: child.stdout }).on('line', (line) => {
  let m; try { m = JSON.parse(line); } catch { return; }
  if (m.id !== undefined && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
  'Access-Control-Allow-Private-Network': 'true',
};

createServer((req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  if (req.method !== 'POST') { res.writeHead(405, cors); return res.end(); }
  let body = '';
  req.on('data', (d) => (body += d));
  req.on('end', () => {
    let m; try { m = JSON.parse(body); } catch { res.writeHead(400, cors); return res.end(); }
    if (m.id === undefined) { child.stdin.write(JSON.stringify(m) + '\n'); res.writeHead(202, cors); return res.end(); }
    const t = setTimeout(() => { pending.delete(m.id); res.writeHead(504, cors); res.end(); }, 120000);
    pending.set(m.id, (r) => { clearTimeout(t); res.writeHead(200, { ...cors, 'Content-Type': 'application/json' }); res.end(JSON.stringify(r)); });
    child.stdin.write(JSON.stringify(m) + '\n');
  });
}).listen(+port, '127.0.0.1', () => console.error('MCP proxy on http://localhost:' + port + '/mcp -> ' + cmd + ' ' + args.join(' ')));
