import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create active Supabase client if configured, otherwise fall back to a mock
// logger so the site functions correctly in demo mode without crashing.
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: () => ({
        insert: async (data) => {
          console.warn('Supabase environment variables not configured yet. Mocking submission data:', data);
          // Wait 500ms to simulate network latency
          await new Promise((resolve) => setTimeout(resolve, 600));
          return { error: null, data };
        }
      })
    };
