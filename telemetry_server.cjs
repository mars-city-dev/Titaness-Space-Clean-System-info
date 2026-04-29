const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');
const satellite = require('satellite.js');

// Unified Backend Port
const PORT = 8080;
const REGISTRY_PATH = path.join(__dirname, 'junker_registry.json');

// Ensure registry exists
if (!fs.existsSync(REGISTRY_PATH)) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify({ candidates: [] }, null, 2));
}

const MASTER_LEDGER_PATH = "d:\\Projects\\Titaness-Metadata-Faktory\\library\\TITANESS_CENTRAL_LEDGER_SSOT.json";

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

  // MASTER LEDGER BRIDGE
  if (parsedUrl.pathname === '/api/mdec-ledger' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (!payload.objectId) throw new Error('Missing objectId');

        const ledger = JSON.parse(fs.readFileSync(MASTER_LEDGER_PATH, 'utf8'));
        const m_id = `urn:mdec:${require('crypto').randomUUID()}`;

        // Add Entry
        ledger.entries[m_id] = {
          m_id: m_id,
          timestamp: new Date().toISOString(),
          action: "ORBITAL_ACQUISITION",
          object_id: payload.objectId,
          catalog_name: payload.name || "Unknown",
          provenance: "TITANESS_SPACE_CLEAN_CONSOLE_v1.0",
          signet: "Christopher-Olds-07-14-1962-2026-Engineer-Musician-Author-Poet-USA"
        };

        // Update Metadata
        ledger._meta.incinerated_debris = (ledger._meta.incinerated_debris || 0) + 1;
        ledger._meta.last_sync = new Date().toISOString();

        fs.writeFileSync(MASTER_LEDGER_PATH, JSON.stringify(ledger, null, 4));

        console.log(`[LEDGER] Acquisition Recorded: ${m_id}`);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'SUCCESS', m_id: m_id }));
      } catch (err) {
        console.error(`[LEDGER ERROR] ${err.message}`);
        res.writeHead(500);
        res.end(JSON.stringify({ status: 'ERROR', message: err.message }));
      }
    });
    return;
  }

  // JUNKER REGISTRY ENDPOINTS
  if (parsedUrl.pathname === '/api/junker-registry') {
    if (req.method === 'GET') {
      const data = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
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

  let currentSatRec = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'SET_TARGET' && data.tle1 && data.tle2) {
        console.log(`[GNC] Target Updated: ${data.id || 'Unknown'}`);
        currentSatRec = satellite.twoline2satrec(data.tle1, data.tle2);
      }
    } catch (e) {
      console.error('[ERROR] Failed to parse WebSocket message');
    }
  });

  const interval = setInterval(() => {
    let propellant = 84.2; // Fixed base propellant
    let syncError = '0.0000';
    let position = null;

    if (currentSatRec) {
      const now = new Date();
      const positionAndVelocity = satellite.propagate(currentSatRec, now);
      const positionEci = positionAndVelocity.position;
      const velocityEci = positionAndVelocity.velocity;

      if (positionEci && velocityEci) {
        // Calculate velocity magnitude as a proxy for "Sync Error" (relative to station-keeping)
        const velMag = Math.sqrt(
          Math.pow(velocityEci.x, 2) +
          Math.pow(velocityEci.y, 2) +
          Math.pow(velocityEci.z, 2)
        );

        // Normalize velocity magnitude to a readable "Sync Error" range for the UI
        syncError = (velMag / 1000).toFixed(4);
        position = {
          x: positionEci.x.toFixed(2),
          y: positionEci.y.toFixed(2),
          z: positionEci.z.toFixed(2)
        };
      }
    }

    const telemetry = {
      type: 'HEARTBEAT',
      propellant: `${(propellant - (Math.random() * 0.05)).toFixed(2)}%`,
      syncError: `${syncError} rad/s`,
      position: position,
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


