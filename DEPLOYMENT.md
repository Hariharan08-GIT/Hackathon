# Deploying to Vercel

This guide will walk you through deploying your full-stack application (React frontend + Express backend) to Vercel's serverless platform.

## Prerequisites

1. [Vercel Account](https://vercel.com/signup) (free tier available)
2. [Vercel CLI](https://vercel.com/cli) installed globally: `npm install -g vercel`
3. MongoDB Atlas account (or another cloud MongoDB provider)
4. Git repository (GitHub, GitLab, or Bitbucket)

## Project Structure

```
Test/
├── api/                    # Serverless functions (backend API routes)
│   ├── auth.js
│   ├── events.js
│   └── registrations.js
├── backend/                # Original Express app (for local development)
├── frontend/               # React + Vite frontend
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json
```

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0 is sufficient)
3. Create a database user with read/write permissions
4. Whitelist all IP addresses (0.0.0.0/0) for Vercel serverless functions
5. Get your connection string (should look like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
   ```

## Step 2: Prepare Environment Variables

You'll need to set these environment variables in Vercel:

### Required Environment Variables:

- `MONGODB_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A secure random string for JWT token signing (generate with `openssl rand -base64 32`)

## Step 3: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**

   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git remote add origin <your-repo-url>
   git push -u origin master
   ```

2. **Connect to Vercel**

   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Select the `Test` folder as the root directory (or configure accordingly)

3. **Configure Project Settings**

   - Framework Preset: `Vite`
   - Root Directory: `./` (or leave as is)
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`
   - Install Command: `npm install`

4. **Add Environment Variables**

   - Go to Project Settings → Environment Variables
   - Add the following variables:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=your_secure_random_string
     ```
   - Make sure to add them for Production, Preview, and Development environments

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (~2-3 minutes)

## Step 4: Deploy via Vercel CLI (Alternative)

1. **Login to Vercel**

   ```bash
   vercel login
   ```

2. **Navigate to project root**

   ```bash
   cd k:\Hackathon\Test
   ```

3. **Deploy**

   ```bash
   vercel
   ```

   Follow the prompts:

   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **hackathon-app** (or your preferred name)
   - In which directory is your code located? **./**
   - Want to override the settings? **Y**
     - Build Command: `npm run build`
     - Output Directory: `frontend/dist`
     - Development Command: `npm run dev:frontend`

4. **Set Environment Variables**

   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   ```

   Follow the prompts to add the values for each environment (production, preview, development)

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 5: Verify Deployment

1. **Test API Endpoints**

   - Visit: `https://your-app.vercel.app/api/auth` (should return route info or error if no route matches)
   - Test login/signup functionality

2. **Test Frontend**

   - Visit: `https://your-app.vercel.app`
   - All pages should load correctly
   - API calls should work (check browser console for errors)

3. **Check Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on any function to view real-time logs

## Troubleshooting

### Issue: "Cannot find module" errors

- **Solution**: Make sure all dependencies are in the correct `package.json` files
- Run `npm install` in both frontend and backend directories locally

### Issue: API routes return 404

- **Solution**: Check `vercel.json` routing configuration
- Verify serverless functions are in the `/api` directory

### Issue: MongoDB connection timeout

- **Solution**:
  - Verify MongoDB Atlas allows connections from 0.0.0.0/0
  - Check your connection string format
  - Ensure environment variables are set correctly in Vercel

### Issue: Build fails

- **Solution**:
  - Check build logs in Vercel dashboard
  - Ensure all dependencies are listed in package.json
  - Verify Node.js version compatibility

### Issue: CORS errors

- **Solution**: Backend routes already have CORS configured, but if needed, you can add specific origins in the API functions

## Local Development

To continue developing locally:

```bash
# Install dependencies
npm run install:all

# Run backend (from Test directory)
cd backend
npm run dev

# Run frontend (from Test directory, new terminal)
cd frontend
npm run dev
```

## Continuous Deployment

Once connected to Git:

- Every push to `master` branch triggers a production deployment
- Pull requests create preview deployments automatically
- View all deployments in Vercel Dashboard

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. SSL certificate is automatically provisioned

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/serverless-functions/introduction)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

## Support

If you encounter any issues:

1. Check Vercel function logs in the dashboard
2. Verify all environment variables are set correctly
3. Review the build logs for any errors
4. Check MongoDB Atlas network access settings

---

**Your app is now deployed! 🎉**

Production URL: `https://your-app-name.vercel.app`
