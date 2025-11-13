# Event Management App - Vercel Deployment

## 🚀 Deploy to Vercel (3 Simple Steps)

### Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a FREE account
2. Create a new cluster (M0 Free tier)
3. **Database Access** → Add user with username & password
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
5. **Database** → **Connect** → Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/hackathon?retryWrites=true&w=majority
   ```

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Deploy to Vercel"
git branch -M master
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin master
```

### Step 3: Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add **Environment Variables**:
   - `MONGODB_URI` = `your-mongodb-connection-string-from-step-1`
   - `JWT_SECRET` = `any-random-secure-string-min-32-chars`
4. Click **Deploy**
5. Done! Your app is live at `https://your-app.vercel.app`

## 🔑 Environment Variables

| Variable      | Value                            | Where to Get                                |
| ------------- | -------------------------------- | ------------------------------------------- |
| `MONGODB_URI` | MongoDB connection string        | MongoDB Atlas → Connect → Connection String |
| `JWT_SECRET`  | Random secure string (32+ chars) | Generate any random string                  |

## 🧪 Test Your Deployment

1. Visit `https://your-app.vercel.app`
2. Click **Sign Up** and create an account
3. **Login** with your credentials
4. Try creating an event
5. Try registering for an event

## 💻 Local Development

```bash
# Install all dependencies
npm run install:all

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 🏗️ Architecture

- **Frontend:** React + Vite (Static Site)
- **Backend:** Vercel Serverless Functions (in `/api` folder)
- **Database:** MongoDB Atlas
- **Hosting:** Vercel

## 📁 Key Files

- `api/auth.js` - Authentication serverless function
- `api/events.js` - Events management serverless function
- `api/registrations.js` - Registration serverless function
- `vercel.json` - Vercel configuration
- `frontend/` - React application
- `backend/` - Original Express app (for local development)

## 🐛 Common Issues

**MongoDB connection fails:**

- Verify Network Access allows `0.0.0.0/0`
- Check connection string format
- Ensure password has no special characters (or URL encode them)

**Build fails:**

- Check Node.js version is 18+ in Vercel settings
- Verify all dependencies are in package.json

**API returns 404:**

- Check Vercel function logs
- Verify environment variables are set

## 📖 API Endpoints

### Auth

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Events

- `GET /api/events?all=true` - Get all events
- `POST /api/events` - Create event (auth required)
- `PUT /api/events/:id` - Update event (auth required)
- `DELETE /api/events/:id` - Delete event (auth required)

### Registrations

- `POST /api/registrations` - Register for event
- `GET /api/registrations/my-events` - Get registrations (auth required)

---

**Questions?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed documentation.
