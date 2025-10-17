# Deployment Guide - Ticket Management Portal

## Overview

This guide provides comprehensive instructions for deploying the Ticket Management Portal to various environments including staging and production.

## Prerequisites

### System Requirements
- Node.js 18+ 
- npm 8+
- Git
- Docker (optional, for containerized deployment)

### Environment Setup
1. Clone the repository
2. Install dependencies: `npm ci`
3. Configure environment variables
4. Build the application
5. Deploy to target environment

## Environment Configuration

### Environment Variables

Create environment-specific files:

#### `.env.production.local`
```bash
# Production Environment Variables
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_APP_ENVIRONMENT=production
# ... other production variables
```

#### `.env.staging.local`
```bash
# Staging Environment Variables
VITE_SUPABASE_URL=your_staging_supabase_url
VITE_SUPABASE_ANON_KEY=your_staging_supabase_anon_key
VITE_APP_ENVIRONMENT=staging
# ... other staging variables
```

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_APP_ENVIRONMENT` | Environment name (staging/production) | Yes |
| `VITE_APP_NAME` | Application name | No |
| `VITE_APP_VERSION` | Application version | No |

## Build Process

### Development Build
```bash
npm run dev
```

### Staging Build
```bash
npm run build:staging
```

### Production Build
```bash
npm run build:production
```

### Build Optimization
- Code splitting enabled
- Tree shaking for unused code
- Asset optimization and compression
- Source maps for debugging (hidden in production)

## Deployment Methods

### 1. Manual Deployment

#### Using Deployment Scripts

**Linux/macOS:**
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

**Windows:**
```powershell
# Deploy to staging
.\scripts\deploy.ps1 staging

# Deploy to production
.\scripts\deploy.ps1 production
```

#### Manual Steps
1. Run pre-deployment checks
2. Build the application
3. Upload files to server
4. Configure web server
5. Test deployment

### 2. Containerized Deployment

#### Build Docker Image
```bash
# Build for production
docker build -t ticket-portal:latest .

# Build for staging
docker build --build-arg BUILD_MODE=staging -t ticket-portal:staging .
```

#### Run Container
```bash
# Run production container
docker run -d -p 8080:8080 --name ticket-portal ticket-portal:latest

# Run with Docker Compose
docker-compose up -d
```

### 3. Cloud Platform Deployment

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to staging
netlify deploy --dir=dist --site=staging-site-id

# Deploy to production
netlify deploy --prod --dir=dist --site=production-site-id
```

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### AWS S3 + CloudFront
```bash
# Install AWS CLI
# Configure AWS credentials

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### Azure Static Web Apps
```bash
# Install Azure CLI
# Login to Azure

# Deploy using Azure CLI
az staticwebapp deploy --name your-app-name --resource-group your-rg --source dist/
```

### 4. CI/CD Deployment

The project includes GitHub Actions workflows for automated deployment:

#### Workflow Triggers
- **Staging**: Push to `develop` branch
- **Production**: Release published

#### Workflow Steps
1. Quality assurance (linting, testing)
2. Security audit
3. Build application
4. Deploy to environment
5. Run smoke tests
6. Notify team

## Web Server Configuration

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/html
    
    # Handle React Router
    <Directory /var/www/html>
        Options -Indexes
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Cache static assets
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>
</VirtualHost>
```

## Database Setup

### Supabase Configuration

1. Create Supabase project
2. Set up database schema
3. Configure Row Level Security (RLS)
4. Set up authentication
5. Configure storage buckets

#### Required Tables
- `users` - User profiles and roles
- `tickets` - Ticket information
- `ticket_comments` - Ticket comments
- `ticket_attachments` - File attachments
- `ticket_timeline` - Activity timeline
- `ticket_types` - Ticket categories

#### RLS Policies
```sql
-- Example RLS policy for tickets
CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING (
        auth.uid() = cliente_id OR 
        auth.uid() = tecnico_id OR 
        (SELECT rol FROM users WHERE id = auth.uid()) = 'admin'
    );
```

## Security Considerations

### HTTPS Configuration
- Always use HTTPS in production
- Configure SSL certificates
- Set up HTTP to HTTPS redirects

### Content Security Policy
```
Content-Security-Policy: default-src 'self'; 
script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
style-src 'self' 'unsafe-inline'; 
img-src 'self' data: https:; 
connect-src 'self' https://your-supabase-url.supabase.co;
```

### Environment Security
- Never commit `.env.local` files
- Use secure environment variable management
- Rotate API keys regularly
- Monitor for security vulnerabilities

## Monitoring and Logging

### Application Monitoring
- Set up error tracking (Sentry)
- Configure performance monitoring
- Monitor Core Web Vitals

### Server Monitoring
- Monitor server resources
- Set up uptime monitoring
- Configure log aggregation

### Health Checks
```bash
# Application health check
curl -f http://your-domain.com/health

# Container health check
docker exec container-name curl -f http://localhost:8080/health
```

## Performance Optimization

### Build Optimizations
- Code splitting by routes and features
- Tree shaking for unused code
- Asset compression and minification
- Bundle analysis and optimization

### Runtime Optimizations
- CDN for static assets
- Browser caching strategies
- Image optimization and lazy loading
- Service worker for offline support

### Database Optimizations
- Proper indexing on frequently queried columns
- Query optimization
- Connection pooling
- Caching strategies

## Backup and Recovery

### Database Backups
- Automated daily backups
- Point-in-time recovery
- Cross-region backup replication

### Application Backups
- Source code in version control
- Environment configuration backups
- Deployment artifact retention

### Recovery Procedures
1. Identify the issue
2. Assess impact and scope
3. Execute recovery plan
4. Verify system functionality
5. Document incident and lessons learned

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for dependency conflicts
npm ls
```

#### Deployment Issues
```bash
# Check build output
npm run build:production

# Verify environment variables
echo $VITE_SUPABASE_URL

# Test locally
npm run preview:production
```

#### Runtime Errors
- Check browser console for errors
- Verify API connectivity
- Check authentication status
- Review server logs

### Debug Mode
```bash
# Enable debug mode
VITE_DEBUG=true npm run build:staging
```

## Rollback Procedures

### Automated Rollback
```bash
# Using deployment script
./scripts/rollback.sh production

# Using Docker
docker-compose down
docker-compose up -d --scale app=0
docker-compose up -d previous-version
```

### Manual Rollback
1. Stop current deployment
2. Restore previous version from backup
3. Update configuration if needed
4. Restart services
5. Verify functionality

## Post-Deployment Checklist

### Immediate Checks
- [ ] Application loads successfully
- [ ] Authentication works
- [ ] Core features functional
- [ ] No console errors
- [ ] Performance metrics acceptable

### Extended Verification
- [ ] All user roles can access appropriate features
- [ ] File uploads work correctly
- [ ] Real-time features functioning
- [ ] Email notifications working
- [ ] Database connections stable

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring enabled
- [ ] Log aggregation working
- [ ] Backup systems verified

## Support and Maintenance

### Regular Maintenance
- Security updates
- Dependency updates
- Performance monitoring
- Backup verification
- Log rotation

### Emergency Contacts
- Development Team: dev-team@company.com
- DevOps Team: devops@company.com
- On-call Engineer: +1-xxx-xxx-xxxx

### Documentation Updates
Keep this deployment guide updated with:
- New deployment procedures
- Configuration changes
- Lessons learned from incidents
- Performance optimization discoveries

---

For additional support or questions about deployment, please contact the development team or refer to the project documentation.