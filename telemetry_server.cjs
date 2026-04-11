const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const url = require('url');

// Port for both WebSocket and HTTP proxy
const PORT = 8080;

// Create an HTTP server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // TLE Proxy Endpoint
  if (parsedUrl.pathname === '/tle') {
    const category = parsedUrl.query.GROUP || 'active';
    const celestrakUrl = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${category}&FORMAT=tle`;
    
    https.get(celestrakUrl, (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => { data += chunk; });
      proxyRes.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(data);
      });
    }).on('error', (err) => {
      res.writeHead(500);
      res.end(`Error: ${err.message}`);
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Attach WebSocket server to the same HTTP server
const wss = new WebSocket.Server({ server });

console.log(`TITANESS SCN Telemetry & Proxy Server started on http://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('[SYSTEM] Console Connected via WebSocket');
  
  const interval = setInterval(() => {
    const telemetry = {
      propellant: (84.2 - (Math.random() * 0.1)).toFixed(2),
      syncError: (0.002 + (Math.random() * 0.0005)).toFixed(4),
      utc: new Date().toISOString()
    };
    ws.send(JSON.stringify(telemetry));
  }, 1000);

  ws.on('close', () => {
    clearInterval(interval);
    console.log('[SYSTEM] Console Disconnected');
  });
});

server.listen(PORT);
