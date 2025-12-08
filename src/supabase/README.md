# Supabase Environment Variables

Add these variables to your `.env.local` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://rxrokcpkstutcoqxacgi.supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY_HERE]
```

## Where to find these values:

1. **VITE_SUPABASE_URL**: 
   - Go to Supabase Dashboard > Settings > API
   - Copy the "Project URL"

2. **VITE_SUPABASE_ANON_KEY**: 
   - Go to Supabase Dashboard > Settings > API
   - Copy the "anon public" key (NOT the service_role key)

## Security Note:

The `anon` key is safe to use in the browser. It's designed to work with Row Level Security (RLS) policies.
