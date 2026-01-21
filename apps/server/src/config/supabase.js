import { createClient } from '@supabase/supabase-js';

let supabaseAdmin = null;

// Lazy initialization - called after dotenv is loaded
function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in your .env file');
    throw new Error('Missing Supabase configuration');
  }

  // Admin client with service role key - can bypass RLS
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

// Function to verify JWT and get user
import jwt from 'jsonwebtoken';

// Function to verify JWT and get user
export async function verifyToken(token) {
  try {
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;

    // 1. Try Local Verification (Faster)
    if (jwtSecret) {
      try {
        const decoded = jwt.verify(token, jwtSecret);
        // Map JWT payload to a standard user object structure
        return {
          id: decoded.sub,
          aud: decoded.aud,
          role: decoded.role,
          email: decoded.email,
          phone: decoded.phone,
          app_metadata: decoded.app_metadata,
          user_metadata: decoded.user_metadata,
          ...decoded
        };
      } catch (err) {
        console.error('Local JWT verification failed:', err.message);
        // If local fails (e.g. invalid signature), don't try remote - it's invalid.
        return null;
      }
    }

    // 2. Fallback to Supabase API (Slower but works without secret)
    // console.log('SUPABASE_JWT_SECRET not set, falling back to API verification');
    const admin = getSupabaseAdmin();
    const { data: { user }, error } = await admin.auth.getUser(token);
    
    if (error) {
      console.error('Token verification error:', error.message);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Export a getter function instead of the client directly
export { getSupabaseAdmin };
export default { getSupabaseAdmin, verifyToken };
