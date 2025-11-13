# Vercel Deployment Checklist

## Pre-Deployment

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 for Vercel)
- [ ] MongoDB connection string obtained
- [ ] JWT_SECRET generated (use: `openssl rand -base64 32`)
- [ ] Code pushed to GitHub/GitLab/Bitbucket

## Deployment Steps

- [ ] Connected repository to Vercel
- [ ] Configured build settings:
  - Root Directory: `./`
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `frontend/dist`
- [ ] Added environment variables in Vercel:
  - `MONGODB_URI`
  - `JWT_SECRET`
- [ ] Triggered deployment
- [ ] Deployment successful (check build logs)

## Post-Deployment Testing

- [ ] Frontend loads at `https://your-app.vercel.app`
- [ ] Home page renders correctly
- [ ] Login page accessible
- [ ] Signup page accessible
- [ ] Can create new account
- [ ] Can login with created account
- [ ] Can view available events
- [ ] Can create new event (if authorized)
- [ ] Can register for event
- [ ] Can view registrations
- [ ] API endpoints responding:
  - [ ] `/api/auth` routes work
  - [ ] `/api/events` routes work
  - [ ] `/api/registrations` routes work
- [ ] Check Vercel function logs for errors
- [ ] No console errors in browser

## Troubleshooting

If issues occur:

1. Check Vercel function logs (Project → Functions → View logs)
2. Verify environment variables are set correctly
3. Check MongoDB Atlas network access settings
4. Review browser console for frontend errors
5. Test API endpoints directly using Postman/curl

## Optional

- [ ] Configure custom domain
- [ ] Set up continuous deployment from main branch
- [ ] Enable preview deployments for pull requests
- [ ] Configure deployment notifications
- [ ] Add monitoring/analytics

---

**Deployment Date:** ******\_******
**Production URL:** ******\_******
**Notes:** ******\_******
