# Deployment Guide for Peaceful LLM

Complete deployment instructions for various platforms.

## Quick Deployment

### Vercel (30 seconds)

```bash
npm install -g vercel
vercel
```

Follow prompts. App will be live at `https://<project-name>.vercel.app`

### Netlify (Drag & Drop)

1. Visit https://app.netlify.com/drop
2. Drag the `zenhaiku_app` folder
3. Done! Your app is live

## Detailed Platform Guides

### 1. Vercel

#### Prerequisites
- GitHub account
- Vercel account (free)

#### Steps

1. **Push to GitHub**
   ```bash
   git add zenhaiku_app
   git commit -m "Add Peaceful LLM"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Set "Root Directory" to `zenhaiku_app`
   - Click Deploy

3. **Custom Domain** (optional)
   - Go to project settings → Domains
   - Add your domain
   - Update DNS records

### 2. GitHub Pages

#### Prerequisites
- GitHub repository
- GitHub account

#### Steps

1. **Create gh-pages branch**
   ```bash
   git checkout -b gh-pages
   git add zenhaiku_app
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

2. **Enable in Settings**
   - Go to repository Settings → Pages
   - Set source to "Deploy from a branch"
   - Select `gh-pages` branch
   - Set folder to `/ (root)` or `/zenhaiku_app`

3. **Access your site**
   - Available at `https://<username>.github.io/<repo-name>`

### 3. Netlify

#### Prerequisites
- Netlify account (free)
- GitHub, GitLab, or Bitbucket account (optional)

#### Option A: Git Integration

1. **Connect repository**
   - Log in to Netlify
   - Click "New site from Git"
   - Select your repository
   - Set "Base directory" to `zenhaiku_app`
   - Deploy

2. **Continuous Deployment**
   - Automatic redeployment on git push
   - Preview builds for pull requests

#### Option B: Drag & Drop

1. Go to https://app.netlify.com/drop
2. Drag `zenhaiku_app` folder
3. Instant deployment

### 4. AWS S3 + CloudFront

#### Prerequisites
- AWS account
- AWS CLI installed

#### Steps

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://peaceful-llm --region us-east-1
   ```

2. **Upload Files**
   ```bash
   aws s3 sync zenhaiku_app s3://peaceful-llm --delete
   ```

3. **Enable Static Website Hosting**
   ```bash
   aws s3 website s3://peaceful-llm \
       --index-document index.html \
       --error-document index.html
   ```

4. **Add Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::peaceful-llm/*"
       }
     ]
   }
   ```

5. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Cache behavior: Forward query strings
   - Viewer protocol policy: Redirect HTTP to HTTPS

### 5. Docker

#### Dockerfile

```dockerfile
FROM nginx:alpine

# Copy application files
COPY zenhaiku_app /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/index.html || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/javascript;
    
    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    
    server {
        listen 80;
        server_name _;
        
        root /usr/share/nginx/html;
        index index.html;
        
        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
        
        # Don't cache HTML
        location ~* \.html$ {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }
}
```

#### Build and Run

```bash
# Build image
docker build -t peaceful-llm:latest .

# Run container
docker run -d -p 80:80 --name peaceful-llm peaceful-llm:latest

# Deploy to production
docker tag peaceful-llm:latest myregistry.azurecr.io/peaceful-llm:latest
docker push myregistry.azurecr.io/peaceful-llm:latest
```

### 6. Azure Static Web Apps

#### Prerequisites
- Azure account
- GitHub account

#### Steps

1. **Create Static Web App**
   - Azure Portal → Create Resource → Static Web App
   - Link GitHub account
   - Select repository and branch
   - Set artifact location to `zenhaiku_app`
   - Create

2. **Automatic Deployment**
   - GitHub Actions workflow created automatically
   - Deploys on every push

### 7. Firebase Hosting

#### Prerequisites
- Firebase project
- Firebase CLI installed

#### Steps

1. **Initialize Firebase**
   ```bash
   firebase init hosting
   ```

2. **Deploy**
   ```bash
   firebase deploy
   ```

### 8. Traditional Web Host

#### Prerequisites
- Web hosting with FTP/SFTP access
- .htaccess support (for routing)

#### Steps

1. **Upload Files**
   - Connect via FTP
   - Upload all files from `zenhaiku_app` to `public_html`

2. **Enable HTTPS**
   - Use hosting provider's SSL certificate
   - Force HTTPS in .htaccess

3. **Configure .htaccess**
   - Included in the project
   - Enables SPA routing and security headers

## Environment-Specific Configuration

### Development

```bash
# Start local server
npm run dev
# http://localhost:8000
```

### Staging

```bash
# Build for staging
npm run build
# Deploy to staging environment
# Test all features before production
```

### Production

```bash
# Production checklist:
# ✓ All API keys configured
# ✓ HTTPS enforced
# ✓ Content Security Policy set
# ✓ Rate limiting configured
# ✓ Logging enabled
# ✓ Backups configured
```

## Post-Deployment

### 1. Verify Deployment

- [ ] App loads at deployment URL
- [ ] Authentication screen appears
- [ ] Session link generation works
- [ ] AI providers test successfully
- [ ] API code generation works
- [ ] Messages display correctly
- [ ] Admin console accessible

### 2. Security Checks

- [ ] HTTPS enforced
- [ ] Security headers set
- [ ] CSP policy configured
- [ ] X-Frame-Options set
- [ ] Cookies marked secure

### 3. Performance Optimization

- [ ] Static assets compressed
- [ ] Images optimized
- [ ] CSS/JS minified
- [ ] Caching headers set
- [ ] CDN enabled

### 4. Monitoring

- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring active
- [ ] Log aggregation set up

## Troubleshooting

### Blank Page After Deployment

**Cause**: Missing files or incorrect path configuration

**Fix**:
- Verify all files copied correctly
- Check browser console for errors
- Ensure index.html is in root directory
- Clear browser cache

### Session Links Not Working

**Cause**: CORS issues or incorrect domain in links

**Fix**:
- Ensure FormSubmit.co endpoint is reachable
- Check browser console network tab
- Verify email sending by checking spam folder
- Test with direct session link input

### Providers Not Responding

**Cause**: API keys missing or rate limiting

**Fix**:
- Verify API keys configured in app
- Check provider status pages
- Ensure CORS is properly handled
- Test providers individually

### High Latency

**Cause**: Poor CDN distribution or slow provider APIs

**Fix**:
- Verify CDN is enabled
- Check API provider response times
- Use Groq (fastest free tier)
- Reduce max tokens to speed up responses

## Scaling Recommendations

### For High Traffic

1. **Use CDN**: CloudFlare, CloudFront, Akamai
2. **Enable Caching**: Set aggressive cache headers
3. **Optimize Images**: Use WebP format
4. **Monitor Performance**: Use Sentry or DataDog
5. **Load Testing**: Test with k6 or Artillery

### Example k6 Load Test

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 100,
  duration: '30s',
};

export default function() {
  let res = http.get('https://your-domain.com/');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'load time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Backup & Recovery

### Backup Strategy

1. **GitHub**: Primary source of truth
2. **Snapshot**: Weekly snapshots of user data
3. **CDN Cache**: Automatic backup by CDN providers

### Recovery Process

```bash
# Rollback to previous version
git revert <commit-hash>
git push origin main

# Redeploy through CI/CD
# Platform will rebuild automatically
```

## Cost Optimization

### Free Tier Usage

- **Vercel**: Free for hobby projects
- **Netlify**: Free with bandwidth limits
- **GitHub Pages**: Always free
- **Firebase**: Free tier includes hosting
- **AWS**: Free tier (first year)
- **Azure**: Always free tier available

### Paid Tier Comparison

| Platform | Price | Bandwidth | Custom Domain |
|----------|-------|-----------|---|
| Vercel Pro | $20/mo | 100GB | Yes |
| Netlify Pro | $19/mo | Unlimited | Yes |
| AWS | Variable | Pay per GB | Yes |
| Azure Premium | $20+/mo | Unlimited | Yes |

---

**Deployment made simple. Choose your platform and get started!**