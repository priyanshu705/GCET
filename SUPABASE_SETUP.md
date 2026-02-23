# Supabase Database Setup Guide

Follow these steps to set up Supabase as your database for the GCET Campus platform.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in" if you have an account
3. Create a new project:
   - **Organization**: Create one or select existing
   - **Project name**: `gcet-campus` (or any name you prefer)
   - **Database password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose the closest region to you
   - **Pricing plan**: Free tier is perfect for development

## Step 2: Get Your Database Connection String

Once your project is created (takes ~2 minutes):

1. Go to **Project Settings** (gear icon on the left sidebar)
2. Click on **Database** tab
3. Scroll down to **Connection string** section
4. Select **Connection pooling** tab (NOT "Direct connection")
5. **Mode**: Select **Session** from the dropdown
6. Copy the connection string
   - It looks like: `postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres`
   - **Port should be 6543** (pooling), not 5432 (direct)
7. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password
8. **If your password has special characters** (like #, @, %, &, etc.), URL-encode them:
   - `#` becomes `%23`
   - `@` becomes `%40`
   - `%` becomes `%25`
   - `&` becomes `%26`
   - Space becomes `%20`


## Step 3: Update Your .env File

1. Open `d:\GCET\.env`
2. Replace the DATABASE_URL with your Supabase connection string:

```env
# Database - USE CONNECTION POOLING URL (port 6543, not 5432)
DATABASE_URL="postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres"
```

**Example with password encoding:**
```env
# If password is "MyP@ss#123" it becomes "MyP%40ss%23123"
DATABASE_URL="postgresql://postgres.abcdefgh:MyP%40ss%23123@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

## Step 4: Push Database Schema to Supabase

After updating the .env file, run:

```bash
npx prisma db push
```

This will create all the tables in your Supabase database.

## Step 5: Verify in Supabase Dashboard

1. Go back to your Supabase project
2. Click **Table Editor** on the left sidebar
3. You should see all your tables:
   - User
   - Match
   - Chat
   - ChatParticipant
   - Message
   - Group
   - GroupMember
   - Report

## Step 6: Regenerate Prisma Client

```bash
npx prisma generate
```

## Step 7: Restart Dev Server

Stop the current dev server (Ctrl+C) and restart:

```bash
npm run dev
```

---

## Supabase Benefits

✅ **Managed PostgreSQL** - No server setup required
✅ **Free Tier** - 500MB database, 2GB file storage, 50,000 monthly active users
✅ **Realtime subscriptions** - Can be used for chat features later
✅ **Built-in Auth** - Optional authentication system
✅ **Storage** - For user profile photos
✅ **Row Level Security** - Advanced security features
✅ **Auto backups** - Daily backups on paid plans

---

## Troubleshooting

### "Can't reach database server" Error
**Solution:**
1. Make sure you're using the **Connection pooling** URL, not the direct connection
2. The URL should have `pooler.supabase.com:6543`, NOT `db.xxx.supabase.co:5432`
3. Go back to Supabase → Settings → Database
4. Click **Connection pooling** tab
5. Select **Session** mode
6. Copy the NEW URL and update your .env

### "Invalid port number" Error
**Solution:**
- Your password likely contains special characters like `#`, `@`, `%`, or `&`
- URL-encode these characters:
  - `#` → `%23`
  - `@` → `%40`
  - `%` → `%25`
  - `&` → `%26`
- Example: Password `Pass#123` becomes `Pass%23123`

### Connection Error
- Make sure you replaced `[YOUR-PASSWORD]` with your actual password
- Check if the connection string is correctly copied (no extra spaces)
- Verify your Supabase project is fully created (green status)

### Tables Not Created
- Run `npx prisma db push` again
- Check the Supabase dashboard for any errors
- Make sure DATABASE_URL is correctly set in .env

### "Too many connections" Error
- Use the **Connection pooling** URL (port 6543), not the direct connection
- This uses Supavisor for connection pooling

---

## Next Steps

Once Supabase is connected:
1. The signup and login should work properly
2. You can view all user data in the Supabase dashboard
3. You can use Supabase Storage for profile photos later
4. You can add Row Level Security policies for extra security
