# 🚀 Supabase Integration Setup Guide

## 📋 Prerequisites
- Supabase account (free tier available)
- Your trading terminal project running

## 🛠️ Step 1: Create Supabase Project

1. **Go to [Supabase](https://supabase.com/dashboard)**
2. **Click "New Project"**
3. **Fill in project details:**
   - Name: `trading-terminal`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users

## 🔧 Step 2: Set up Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy and paste** the contents of `supabase-schema.sql`
3. **Click "Run"** to create all tables and functions

## 🔑 Step 3: Get API Credentials

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy the following:**
   - Project URL
   - Anon (public) key

## ⚙️ Step 4: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp apps/server/.env.example apps/server/.env
   ```

2. **Edit `apps/server/.env`:**
   ```env
   SERVER_PORT=3001
   TICK_DATA_PATH=./data/ticks
   
   # Add your Supabase credentials
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 📦 Step 5: Install Dependencies

```bash
cd apps/server
npm install @supabase/supabase-js
```

## 🚀 Step 6: Restart Your Server

```bash
npm run dev
```

You should see: `✅ Supabase integration enabled`

## 🎯 Step 7: Test the Integration

### Test Authentication:
```bash
# Sign up a new user
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Sign in
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Watchlist:
```bash
# Add symbol to watchlist (replace USER_ID with actual user ID)
curl -X POST http://localhost:3001/api/users/USER_ID/watchlist \
  -H "Content-Type: application/json" \
  -d '{"symbol":"EURUSD"}'

# Get watchlist
curl http://localhost:3001/api/users/USER_ID/watchlist
```

## 🌟 New Features Available

### 👥 User Management
- ✅ User registration and authentication
- ✅ Secure session management
- ✅ Password-based login

### 📊 Personal Trading Features
- ✅ **Watchlists** - Save favorite currency pairs
- ✅ **Virtual Trading** - Track paper trades
- ✅ **Performance Analytics** - Win rate, P&L tracking
- ✅ **Price Alerts** - Get notified when prices hit targets

### 📈 Advanced Analytics
- ✅ **Trade Statistics** - Detailed performance metrics
- ✅ **Historical Data Storage** - Optional candle data persistence
- ✅ **Real-time Updates** - Live data synchronization

### 🔄 Real-time Features
- ✅ **Live Watchlist Updates** - Changes sync across devices
- ✅ **Trade Notifications** - Real-time trade updates
- ✅ **Price Alert Triggers** - Instant notifications

## 🎨 Frontend Integration

To use these features in your React frontend, you'll need to:

1. **Install Supabase client:**
   ```bash
   cd apps/client
   npm install @supabase/supabase-js
   ```

2. **Create authentication components**
3. **Add user dashboard**
4. **Integrate watchlist functionality**

## 🔒 Security Features

- ✅ **Row Level Security (RLS)** - Users only see their own data
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **API Rate Limiting** - Built-in protection
- ✅ **SQL Injection Protection** - Parameterized queries

## 📊 Database Tables Created

- `watchlists` - User's favorite symbols
- `trades` - Virtual trading records
- `price_alerts` - Price notification settings
- `historical_candles` - Optional candle data storage
- `trade_performance` - Analytics view

## 🚨 Troubleshooting

### "Supabase not configured" error:
- Check your `.env` file has correct credentials
- Verify SUPABASE_URL and SUPABASE_ANON_KEY are set
- Restart your server after adding credentials

### Database connection issues:
- Verify your Supabase project is active
- Check the SQL schema was run successfully
- Ensure RLS policies are enabled

### Authentication errors:
- Confirm email/password requirements
- Check Supabase Auth settings
- Verify API keys are correct

## 🎉 Success!

Your trading terminal now has:
- 👥 User accounts and authentication
- 📊 Personal trading features
- 📈 Advanced analytics
- 🔄 Real-time data synchronization
- 🔒 Enterprise-grade security

Ready to build the next-level trading platform! 🚀