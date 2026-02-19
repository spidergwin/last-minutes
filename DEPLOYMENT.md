# Deployment Guide - Last Minutes SaaS

## 🚀 Pre-Deployment Checklist

- [ ] All environment variables set in production
- [ ] Database migrations run on production DB
- [ ] External services configured and tested
- [ ] SSL/TLS certificates configured
- [ ] Backup strategy in place
- [ ] Monitoring/logging configured
- [ ] Rate limits appropriate for production
- [ ] Admin user created
- [ ] Email service configured (if needed)

## 📡 Deployment Platforms

### Option 1: Vercel (Recommended)

Vercel has first-class Next.js support:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
# ... add others
```

**Database:** Use Vercel Postgres or Neon for PostgreSQL

### Option 2: Docker + Cloud Run / DigitalOcean

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and push
docker build -t last-minutes:latest .
docker push docker-registry/last-minutes:latest

# Deploy on DigitalOcean App Platform
doctl apps create --spec app.yaml
```

### Option 3: Self-Hosted (VPS)

```bash
# SSH into server
ssh user@server.com

# Clone repository
git clone https://github.com/your-org/last-minutes.git
cd last-minutes

# Install dependencies
npm ci --production

# Build
npm run build

# Use PM2 for process management
npm i -g pm2
pm2 start npm --name "last-minutes" -- start

# Setup Nginx reverse proxy
# (configure at /etc/nginx/sites-available/last-minutes)

# Auto-start on reboot
pm2 startup
pm2 save
```

## 🗄️ Database Deployment

### PostgreSQL Setup

**Option A: Managed Service**
- Vercel Postgres
- Neon
- AWS RDS
- DigitalOcean Managed Database

**Option B: Self-Hosted**
```bash
# Create database
createdb lastminutes

# Run migrations
npm run db:push

# Seed data
npm run db:seed
```

## 🔐 Security Hardening

### Environment Variables
```bash
# Generate secure secret
BETTER_AUTH_SECRET=$(openssl rand -base64 32)

# Store in vault
# - GitHub Secrets for CI/CD
# - Vercel Environment Variables
# - HashiCorp Vault for self-hosted
```

### HTTPS/SSL
- Use Let's Encrypt for self-hosted
- Vercel handles automatically
- Configure HSTS headers

### Database
- Enable encryption at rest
- Use SSL for connections
- Regular backups to S3/backup service
- Monitor for unusual queries

### Rate Limiting
- Configure Upstash Redis properly
- Set different limits per plan
- Monitor for DDoS attacks

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# Sentry for error tracking
npm i @sentry/nextjs

# Configure in next.config.ts
```

### Logging
```typescript
// Use structured logging
console.log(JSON.stringify({
  level: "info",
  timestamp: new Date().toISOString(),
  message: "User signup",
  userId: user.id,
}));
```

### Uptime Monitoring
- Pingdom or Uptime Kuma for uptime checks
- Configure alerts for downtime

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      - run: npm run lint
      
      - run: npm run build
      
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## 📈 Scaling Strategies

### Phase 1: MVP (Current)
- Single Next.js instance
- Shared database
- Works for 1-10K users

### Phase 2: Growth (5K-100K users)
- Multiple Node.js instances behind load balancer
- Separate read replicas for reporting
- Caching layer (Redis)
- CDN for static assets

### Phase 3: Enterprise (100K+ users)
- Microservices for transcription/translation
- Event streaming (Kafka)
- Data warehouse for analytics
- Multi-region deployment
- GraphQL API option

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pooling (if using PgBouncer)
psql -U pgbouncer -h localhost -p 6432
```

### High Memory Usage
- Check for memory leaks in Node.js
- Review database query performance
- Optimize bundle size with `npm run build --analyze`

### Slow Deployments
- Check build time: `npm run build`
- Review dependencies for size
- Use CDN for large static files

## 🔄 Rollback Strategy

```bash
# If deployment fails
vercel --prod --target production --env-target production

# Or with Docker
docker pull last-minutes:previous
docker compose up -d
```

## 📋 Post-Deployment

- [ ] Verify all pages load correctly
- [ ] Test authentication flow
- [ ] Test dictation with microphone
- [ ] Test translation with all languages
- [ ] Check admin panel access
- [ ] Verify database connection
- [ ] Test file uploads
- [ ] Monitor error logs for 24h
- [ ] Performance testing under load

## 📞 Support & Monitoring

- Set up error alerts (Sentry, DataDog)
- Configure uptime monitoring
- Create on-call rotation
- Document runbook for common issues
- Set up metrics dashboard

## 🎯 Performance Targets (Production)

- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- API Response Time: < 200ms (p95)
- Database Query Time: < 50ms (p95)

Monitor with:
- Google PageSpeed Insights
- WebPageTest
- New Relic / Datadog APM
