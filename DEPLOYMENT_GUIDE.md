# Deployment Guide - Hyperlocal Marketplace

## Prerequisites
- GitHub account (code already pushed ✓)
- Vercel account (free)
- Render account (free)
- Railway/PlanetScale account (free MySQL hosting)
- Stripe account

## Step 1: Deploy Database (Railway - Recommended)

1. **Go to Railway.app**
   - Sign up/Login with GitHub
   - Click "New Project"
   - Select "Provision MySQL"
   - Copy connection details (host, user, password, database name)

2. **Import Database Schema**
   - Connect to Railway MySQL using MySQL Workbench or command line
   - Run `DATABASE_SETUP.sql` to create tables
   - Run `seed_mock_data.js` if you want test data

   ```bash
   # From db2_test folder
   node seed_mock_data.js
   ```

## Step 2: Deploy Backend (Render)

1. **Go to Render.com**
   - Sign up/Login with GitHub
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Hyperlocal-community-marketplace/Hyperlocal`
   - Select the repository

2. **Configure Build Settings**
   - **Name**: `hyperlocal-backend`
   - **Root Directory**: `db2_test`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

3. **Add Environment Variables** (in Render dashboard)
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=<your-railway-mysql-host>
   DB_USER=<your-railway-mysql-user>
   DB_PASSWORD=<your-railway-mysql-password>
   DB_NAME=<your-railway-database-name>
   JWT_SECRET=<generate-random-secret-key>
   JWT_EXPIRE=7d
   STRIPE_SECRET_KEY=<your-stripe-secret-key>
   STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
   FRONTEND_URL=<will-add-after-frontend-deploy>
   ```

   **To generate JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Click "Create Web Service"**
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://hyperlocal-backend.onrender.com`

## Step 3: Deploy Frontend (Vercel)

1. **Go to Vercel.com**
   - Sign up/Login with GitHub
   - Click "Add New..." → "Project"
   - Import `Hyperlocal-community-marketplace/Hyperlocal`

2. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Add Environment Variables**
   ```
   VITE_API_URL=https://hyperlocal-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=<your-stripe-publishable-key>
   VITE_SOCKET_URL=https://hyperlocal-backend.onrender.com
   ```

4. **Click "Deploy"**
   - Wait for deployment (2-3 minutes)
   - Copy your frontend URL: `https://hyperlocal-marketplace.vercel.app`

## Step 4: Update Backend CORS & Environment

1. **Go back to Render Dashboard**
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy the service

2. **Update CORS in server.js** (if needed)
   - The app should automatically pick up `FRONTEND_URL` from env

## Step 5: Configure API URLs in Frontend Code

You'll need to update any hardcoded API URLs in your frontend code to use environment variables:

```typescript
// Example: lib/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

## Step 6: Test Your Deployment

1. **Visit your frontend URL**
2. **Test Registration/Login**
3. **Test Product Browsing**
4. **Test Cart & Checkout**
5. **Test Real-time Chat**

## Deployment URLs Structure

- **Frontend**: `https://your-app-name.vercel.app`
- **Backend API**: `https://your-backend.onrender.com/api`
- **Database**: Railway MySQL (internal connection)

## Important Notes

### Free Tier Limitations:
- **Render**: Service spins down after 15 minutes of inactivity (cold starts ~30 seconds)
- **Vercel**: Unlimited for hobby projects
- **Railway**: $5 free credit per month (enough for small projects)

### Security Checklist:
- ✓ Never commit `.env` files (already in .gitignore)
- ✓ Use strong JWT_SECRET (32+ characters)
- ✓ Use Stripe test keys for development
- ✓ Enable HTTPS only (automatic on Vercel/Render)

### Continuous Deployment:
Both Vercel and Render automatically redeploy when you push to GitHub main branch!

## Troubleshooting

### Backend Issues:
```bash
# Check Render logs
# Go to Render Dashboard → Your Service → Logs
```

### Frontend Issues:
```bash
# Check Vercel logs
# Go to Vercel Dashboard → Your Project → Deployments → Logs
```

### Database Connection Issues:
- Verify Railway MySQL is running
- Check connection credentials in Render environment variables
- Test connection from Railway dashboard

## Alternative Deployment Options

### Backend Alternatives:
- **Railway**: $5/month credit (includes database)
- **Fly.io**: Free tier available
- **Heroku**: Paid plans only

### Database Alternatives:
- **PlanetScale**: Free tier (5GB storage, 1 billion reads/month)
- **Supabase**: Free tier (500MB database)
- **AWS RDS Free Tier**: 750 hours/month (12 months free)

### Frontend Alternatives:
- **Netlify**: Similar to Vercel
- **GitHub Pages**: Free (static hosting only)
- **Cloudflare Pages**: Free, unlimited bandwidth

## Cost Estimate

**Free Tier (Perfect for Development/Portfolio):**
- Vercel: $0
- Render: $0
- Railway: $0 (with $5 monthly credit)
- **Total: $0/month**

**Production Ready (Upgraded):**
- Vercel Pro: $20/month
- Render Standard: $7/month
- Railway Database: $5/month
- **Total: $32/month**

## Quick Deploy Commands

```bash
# Build frontend locally to test
cd frontend
npm run build
npm run preview

# Build backend locally to test
cd db2_test
npm install
node server.js
```

## Next Steps After Deployment

1. **Custom Domain** (Optional)
   - Buy domain from Namecheap/GoDaddy
   - Add to Vercel: Settings → Domains
   - Add to Render: Settings → Custom Domain

2. **SSL Certificate**: Automatic on both platforms ✓

3. **Monitoring**: Use Render/Vercel built-in monitoring

4. **Analytics**: Add Google Analytics or Vercel Analytics

5. **Error Tracking**: Consider Sentry.io (free tier available)

---

**Ready to deploy?** Start with Step 1 and follow each step in order!
