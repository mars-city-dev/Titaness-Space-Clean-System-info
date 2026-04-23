const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Unified Backend Port
const PORT = 8080;
const REGISTRY_PATH = path.join(__dirname, 'junker_registry.json');

// Ensure registry exists
if (!fs.existsSync(REGISTRY_PATH)) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ candidates: [] }, null, 2));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // JUNKER REGISTRY ENDPOINTS
  if (parsedUrl.pathname === '/api/junker-registry') {
    if (req.method === 'GET') {
      const data = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
      // Sort by score descending
      data.candidates.sort((a, b) => b.score - a.score);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    } 
    
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const newCandidate = JSON.parse(body);
          if (!newCandidate.name || typeof newCandidate.score !== 'number') {
            throw new Error('Invalid Candidate Data');
          }
          
          const data = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
          newCandidate.date = new Date().toISOString();
          data.candidates.push(newCandidate);
          
          fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2));
          
          // Broadcast to WebSockets
          broadcast({ type: 'NEW_JUNKER', name: newCandidate.name, score: newCandidate.score });
          
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'SUCCESS', message: 'Candidate Registered' }));
        } catch (err) {
          res.writeHead(400);
          res.end(JSON.stringify({ status: 'ERROR', message: err.message }));
        }
      });
      return;
    }
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

const wss = new WebSocket.Server({ server });

function broadcast(msg) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
}

console.log(`TITANESS COMMAND CORE started on http://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('[SYSTEM] Console Connected via WebSocket');
  
  const interval = setInterval(() => {
    const telemetry = {
      type: 'HEARTBEAT',
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

