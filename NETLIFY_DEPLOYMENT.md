# Netlify Deployment Guide for Kibegi Frontend

## Prerequisites
- A Netlify account (free tier works fine)
- GitHub repository (optional, but recommended for continuous deployment)

## Deployment Methods

### Method 1: GitHub Integration (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   git push origin main
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and authorize Netlify
   - Select your repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - The `netlify.toml` file will automatically configure everything else

4. **Set Environment Variables**
   - Go to Site settings → Environment variables
   - Add your environment variables:
     ```
     VITE_API_URL=https://your-backend-api.com
     VITE_APP_NAME=Kibegi
     # Add any other VITE_ prefixed variables you need
     ```

5. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically deploy on every push to main

### Method 2: Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and Deploy**
   ```bash
   # Initialize (first time only)
   netlify init

   # Build your project
   npm run build

   # Deploy to production
   netlify deploy --prod
   ```

### Method 3: Manual Drag & Drop

1. **Build your project locally**
   ```bash
   npm run build
   ```

2. **Go to Netlify**
   - Visit [Netlify Drop](https://app.netlify.com/drop)
   - Drag and drop your `dist` folder

## Configuration Details

### netlify.toml Features
- ✅ Optimized build settings for Vite + React
- ✅ SPA routing (React Router support)
- ✅ Security headers (XSS, CORS, CSP)
- ✅ Aggressive caching for static assets
- ✅ PWA support (service worker handling)
- ✅ Lighthouse performance monitoring
- ✅ Image and asset compression

### Environment Variables
Make sure to set these in Netlify Dashboard:

```env
VITE_API_URL=your_backend_api_url
# Add any other environment variables your app needs
```

**Important**: Only variables prefixed with `VITE_` are exposed to your React app.

## Custom Domain Setup

1. **Add your domain in Netlify**
   - Go to Domain settings → Add custom domain
   - Enter: `kibegi.com` and `www.kibegi.com`

2. **Update DNS**
   - Add Netlify DNS records to your domain registrar
   - Netlify will provide the nameservers or DNS records

3. **Enable HTTPS**
   - Netlify automatically provisions SSL certificates
   - Force HTTPS in Domain settings

## Performance Optimization

The `netlify.toml` includes:
- **Asset Caching**: 1 year cache for JS, CSS, images, fonts
- **HTML**: No cache (always fresh)
- **PWA Files**: No cache (service worker updates)
- **Build Processing**: Minification and compression
- **Lighthouse**: Automatic performance monitoring

## Troubleshooting

### Build Fails
- Check Node version matches (v18 required)
- Verify all dependencies in package.json
- Check build logs in Netlify dashboard

### 404 Errors on Routes
- Ensure `_redirects` file is in `public/` folder
- Verify netlify.toml redirect rules

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Rebuild after adding environment variables
- Clear deploy cache and retry

### API Connection Issues
- Verify VITE_API_URL is correct
- Check CORS settings on your backend
- Update Content-Security-Policy in netlify.toml if needed

## Continuous Deployment

Once connected to GitHub:
- Every push to `main` → automatic production deploy
- Pull requests → automatic preview deploys
- Branch deploys → configurable per branch

## Post-Deployment Checklist

- [ ] Test all routes work correctly
- [ ] Verify API connections
- [ ] Check PWA installation
- [ ] Test on mobile devices
- [ ] Verify authentication flows
- [ ] Check console for errors
- [ ] Test remember me functionality
- [ ] Verify file uploads work
- [ ] Test all forms (login, signup, password reset)

## Monitoring

- **Analytics**: Enable in Netlify dashboard
- **Logs**: Real-time logs available in Functions tab
- **Performance**: Lighthouse reports run automatically
- **Errors**: Check browser console and Netlify logs

## Rollback

If something goes wrong:
1. Go to Deploys in Netlify dashboard
2. Find the last working deploy
3. Click "Publish deploy" to rollback

## Support

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify Community](https://answers.netlify.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
