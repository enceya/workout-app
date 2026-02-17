# 💪 Workout Tracker

A full-stack workout tracking application built with Next.js 15, Supabase, and TypeScript.

## Features

- 🔐 User authentication with Supabase Auth
- 📝 Create and track workouts
- 💪 Exercise library with 12+ pre-loaded exercises
- 📊 Track sets, reps, and weight for each exercise
- 📅 Date-based workout history
- 🗑️ Delete workouts
- 📱 Responsive design with Tailwind CSS

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Backend:** Supabase (PostgreSQL database, Authentication)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Database Schema

The app uses the following tables:
- `profiles` - User profiles
- `exercises` - Exercise library (pre-loaded + custom)
- `workouts` - Workout sessions
- `workout_exercises` - Exercises performed in each workout with sets/reps/weight

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your project from your Git repository (or upload the files)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://mauuophkogsejtuesbhj.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key from .env.local)
4. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to project: `cd workout-app`
3. Run: `vercel`
4. Follow the prompts to link to your Vercel account
5. Environment variables will be automatically picked up from `.env.local`

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign Up/Sign In:** Create an account or sign in with email/password
2. **Create Workout:** Click "New Workout" button
3. **Add Exercises:** Select exercises from the dropdown
4. **Track Sets:** Add multiple sets with reps and weight
5. **Save:** Save your workout to view in history
6. **View History:** Click on any workout to expand and see details

## Supabase Configuration

Your Supabase project is already configured with:
- ✅ Database schema created
- ✅ Row Level Security policies enabled
- ✅ 12 pre-loaded exercises
- ✅ API keys configured

## Security

- Row Level Security (RLS) ensures users can only access their own data
- Authentication handled by Supabase Auth
- Secure API keys using environment variables

## License

MIT
