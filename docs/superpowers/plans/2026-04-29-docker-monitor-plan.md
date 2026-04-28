# Docker Container Monitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time Docker container monitoring interface within the admin panel.

**Architecture:** A Node.js sidecar agent (`monitor-agent`) interfaces with the local Docker daemon. The NestJS backend acts as a secure reverse-proxy, providing WebSocket and REST communication to the Next.js frontend `/admin/monitor` page.

**Tech Stack:** Fastify, Dockerode, NestJS (WebSockets, Socket.io), React, TailwindCSS.

---

### Task 1: Initialize Monitor Agent Sidecar
Create the containerized Node.js service that accesses the Docker socket.

**Files:**
- Create: `yunkhngn-infra/monitor-agent/package.json`
- Create: `yunkhngn-infra/monitor-agent/Dockerfile`
- Create: `yunkhngn-infra/monitor-agent/src/index.js`
- Create: `yunkhngn-infra/monitor-agent/src/docker.js`
- Modify: `yunkhngn-infra/docker-compose.yml`

- [ ] **Step 1: Create `package.json`**
```json
{
  "name": "yunkhngn-monitor-agent",
  "version": "1.0.0",
  "description": "Sidecar monitor proxy",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "dockerode": "^4.0.2",
    "fastify": "^4.26.2",
    "ws": "^8.16.0"
  }
}
```

- [ ] **Step 2: Create Dockerfile**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 9100
CMD ["npm", "start"]
```

- [ ] **Step 3: Create `src/docker.js` to wrap Dockerode**
```javascript
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

async function listContainers() {
  const containers = await docker.listContainers({ all: true });
  return containers.map(c => ({
    id: c.Id,
    names: c.Names,
    image: c.Image,
    state: c.State,
    status: c.Status
  }));
}

module.exports = { docker, listContainers };
```

- [ ] **Step 4: Create `src/index.js` Fastify server**
```javascript
const fastify = require('fastify')({ logger: true });
const WebSocket = require('ws');
const { docker, listContainers } = require('./docker');

fastify.get('/containers', async (request, reply) => {
  return listContainers();
});

const start = async () => {
  try {
    await fastify.listen({ port: 9100, host: '0.0.0.0' });
    const wss = new WebSocket.Server({ server: fastify.server, path: '/logs' });

    wss.on('connection', (ws, req) => {
      const url = new URL(req.url, 'http://localhost');
      const containerId = url.searchParams.get('containerId');
      
      if (!containerId) {
        ws.send(JSON.stringify({ type: 'error', message: 'Missing containerId' }));
        return ws.close();
      }

      const container = docker.getContainer(containerId);
      const logOpts = {
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: true,
        tail: 100
      };

      container.logs(logOpts, (err, stream) => {
        if (err || !stream) {
          ws.send(JSON.stringify({ type: 'error', message: 'Failed to stream logs' }));
          return ws.close();
        }

        ws.on('close', () => stream.destroy());

        stream.on('data', (chunk) => {
          ws.send(JSON.stringify({
            type: 'log',
            containerId,
            message: chunk.toString('utf8')
          }));
        });
      });
    });

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
```

- [ ] **Step 5: Modify `docker-compose.yml` to map sidecar and expose socket**
Target Content: `backend:` block
Replacement Content:
```yaml
  monitor-agent:
    build: ./monitor-agent
    container_name: yunkhngn-monitor
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - app-network
```

- [ ] **Step 6: Commit**
```bash
git add yunkhngn-infra/
git commit -m "feat: setup monitor-agent sidecar"
```

---

### Task 2: Implement Backend Monitoring Module
Bridge the frontend to the internal monitor agent.

**Files:**
- Create: `yunkhngn-be/src/modules/monitor/monitor.service.ts`
- Create: `yunkhngn-be/src/modules/monitor/monitor.controller.ts`
- Create: `yunkhngn-be/src/modules/monitor/monitor.gateway.ts`
- Create: `yunkhngn-be/src/modules/monitor/monitor.module.ts`
- Modify: `yunkhngn-be/src/app.module.ts`

- [ ] **Step 1: Create `monitor.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MonitorService {
  private agentUrl: string;

  constructor(private configService: ConfigService) {
    this.agentUrl = this.configService.get<string>('MONITOR_AGENT_URL') || 'http://monitor-agent:9100';
  }

  async getContainers() {
    const res = await fetch(`${this.agentUrl}/containers`);
    return res.json();
  }
}
```

- [ ] **Step 2: Create `monitor.controller.ts`**
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { FirebaseAuthGuard } from '../../common/guards';

@Controller('monitor')
@UseGuards(FirebaseAuthGuard)
export class MonitorController {
  constructor(private monitorService: MonitorService) {}

  @Get('containers')
  async getContainers() {
    return this.monitorService.getContainers();
  }
}
```

- [ ] **Step 3: Create `monitor.gateway.ts` to forward WS logs**
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as WebSocket from 'ws';

@WebSocketGateway({ cors: { origin: '*' } })
export class MonitorGateway {
  @WebSocketServer() server: Server;
  private connections = new Map<string, WebSocket>();

  @SubscribeMessage('monitor:subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { containerId: string }
  ) {
    const agentWsUrl = `ws://monitor-agent:9100/logs?containerId=${data.containerId}`;
    const agentWs = new WebSocket(agentWsUrl);

    agentWs.on('message', (msg) => {
      client.emit('monitor:log', JSON.parse(msg.toString()));
    });

    agentWs.on('close', () => {
      client.emit('monitor:closed', { containerId: data.containerId });
    });

    this.connections.set(client.id, agentWs);
  }

  @SubscribeMessage('monitor:unsubscribe')
  handleUnsubscribe(@ConnectedSocket() client: Socket) {
    const ws = this.connections.get(client.id);
    if (ws) {
      ws.close();
      this.connections.delete(client.id);
    }
  }
}
```

- [ ] **Step 4: Create `monitor.module.ts` and update `app.module.ts`**
Import `MonitorModule` into `AppModule`.

- [ ] **Step 5: Commit**
```bash
git add yunkhngn-be/
git commit -m "feat: backend monitor endpoints and gateway proxy"
```

---

### Task 3: Build Frontend Monitor Tab Interface
Deliver the frontend panel supporting individual container monitoring.

**Files:**
- Create: `yunkhngn-fe/app/(admin)/admin/monitor/page.jsx`
- Create: `yunkhngn-fe/app/(admin)/admin/monitor/MonitorClient.jsx`

- [ ] **Step 1: Scaffold Next.js Monitor Panel**
Set UI logic to stream and display container health logs with highlighted exceptions using client logic.
