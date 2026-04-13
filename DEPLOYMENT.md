# Deployment Guide

## Production Build

### 1. Build Both Applications

```bash
npm run build
```

This compiles:
- Client: `apps/client/dist/`
- Server: `apps/server/dist/`

### 2. Environment Variables

Create production `.env` files:

#### Server (apps/server/.env.production)
```
SERVER_PORT=3001
TICK_DATA_PATH=/var/data/ticks
NODE_ENV=production
```

#### Client (apps/client/.env.production)
```
VITE_API_URL=https://your-domain.com
VITE_WS_URL=wss://your-domain.com
```

### 3. Server Deployment

#### Option A: Node.js Server

```bash
cd apps/server
npm install --production
node dist/index.js
```

#### Option B: PM2 (Recommended)

```bash
npm install -g pm2
cd apps/server
pm2 start dist/index.js --name trading-server
pm2 save
pm2 startup
```

#### Option C: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY apps/server/package*.json ./
RUN npm install --production
COPY apps/server/dist ./dist
COPY apps/server/data ./data
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t trading-server .
docker run -d -p 3001:3001 -v /path/to/ticks:/app/data/ticks trading-server
```

### 4. Client Deployment

#### Option A: Static Hosting (Vercel, Netlify, etc.)

The client is a static SPA. Deploy `apps/client/dist/` to any static host.

Vercel:
```bash
cd apps/client
vercel --prod
```

Netlify:
```bash
cd apps/client
netlify deploy --prod --dir=dist
```

#### Option B: Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/trading-terminal;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /stream {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Copy files:
```bash
cp -r apps/client/dist/* /var/www/trading-terminal/
```

### 5. SSL/TLS (HTTPS)

Use Let's Encrypt with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 6. Performance Optimization

#### Enable Gzip Compression (Nginx)

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

#### Enable Caching

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 7. Monitoring

#### Server Logs (PM2)

```bash
pm2 logs trading-server
pm2 monit
```

#### Health Check Endpoint

Add to server:

```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});
```

### 8. Backup Strategy

#### Tick Data Backup

```bash
# Daily backup
0 2 * * * tar -czf /backup/ticks-$(date +\%Y\%m\%d).tar.gz /var/data/ticks
```

#### Database Backup (if using SQLite)

```bash
# Daily backup
0 2 * * * cp /var/data/trading.db /backup/trading-$(date +\%Y\%m\%d).db
```

### 9. Security Checklist

- [ ] Enable HTTPS/WSS
- [ ] Set up firewall (allow only 80, 443, 22)
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up CORS properly
- [ ] Keep dependencies updated
- [ ] Use strong passwords for server access
- [ ] Enable fail2ban for SSH protection

### 10. Scaling

#### Horizontal Scaling

Use a load balancer (Nginx, HAProxy) to distribute traffic across multiple server instances.

#### Vertical Scaling

- Increase server RAM for larger tick datasets
- Use SSD storage for faster file I/O
- Enable Node.js clustering

```typescript
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Start server
}
```

### 11. Troubleshooting

#### WebSocket Connection Issues

- Ensure proxy supports WebSocket upgrade
- Check firewall rules
- Verify WSS certificate is valid

#### High Memory Usage

- Limit tick data loaded into memory
- Implement pagination
- Use streaming for large datasets

#### Slow Chart Loading

- Enable gzip compression
- Optimize candle aggregation
- Use CDN for static assets

## Production Checklist

- [ ] Build both client and server
- [ ] Set production environment variables
- [ ] Deploy server with PM2 or Docker
- [ ] Deploy client to static host or Nginx
- [ ] Enable HTTPS/WSS
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Test all features in production
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Document deployment process
