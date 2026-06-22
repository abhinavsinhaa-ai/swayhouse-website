import { createClient } from '@supabase/supabase-js';
import { ROSTER } from './roster';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isConfigured = !!(supabaseUrl && supabaseAnonKey);

// Mock data for demo mode when Supabase is not configured
const MOCK_CONTACTS = [
  { id: '1', type: 'Creator', name: 'Kabir Dev', email: 'kabir@gmail.com', instagram: 'kabirdev.creates', message: 'Hii Abhinav, I am a travel creator with 15k followers. Love your work, would love to join your roster!', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: '2', type: 'Brand', name: 'Plum Goodness', email: 'campaigns@plumgoodness.com', instagram: 'plumgoodness', message: 'Looking for lifestyle/wellness creators for an upcoming organic skincare campaign. Do you have creators in Bangalore?', created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: '3', type: 'Creator', name: 'Riya Sen', email: 'riya.sen@yahoo.com', instagram: 'riya_styling', message: 'Hey! I do fashion and aesthetic lifestyle reels. 8k followers with 7% engagement. Looking for brand deals.', created_at: new Date(Date.now() - 3600000 * 24).toISOString() }
];

const MOCK_CHATS = [
  { id: '101', session_id: 'sess-1', role: 'user', message: 'hii', created_at: new Date(Date.now() - 600000 * 5).toISOString() },
  { id: '102', session_id: 'sess-1', role: 'model', message: 'Hello! I am SwayAI, your brand consultant from SwayHouse. How can I help you grow today?', created_at: new Date(Date.now() - 600000 * 4.9).toISOString() },
  { id: '103', session_id: 'sess-1', role: 'user', message: 'how much can I earn with 10k followers?', created_at: new Date(Date.now() - 600000 * 4.5).toISOString() },
  { id: '104', session_id: 'sess-1', role: 'model', message: 'With 10,000 followers (Micro-creator), you can earn roughly **₹2,000 to ₹8,000 per sponsored Reel** in India. This depends heavily on engagement rates and niche.', created_at: new Date(Date.now() - 600000 * 4).toISOString() },
  { id: '105', session_id: 'sess-2', role: 'user', message: 'Do you manage creators in Delhi?', created_at: new Date(Date.now() - 3600000 * 3).toISOString() },
  { id: '106', session_id: 'sess-2', role: 'model', message: 'Yes, SwayHouse is based in India and manages creators across all major metros including Delhi, Mumbai, Bangalore, and Pune. We operate remotely.', created_at: new Date(Date.now() - 3600000 * 2.9).toISOString() }
];

const MOCK_PAGEVIEWS = [
  { id: 'p1', visitor_id: 'v-1', path: '/', referrer: 'https://instagram.com', device_type: 'Mobile', os: 'iOS', country: 'India', city: 'Mumbai', created_at: new Date(Date.now() - 1200000).toISOString() },
  { id: 'p2', visitor_id: 'v-1', path: '/creators/aditi', referrer: '/', device_type: 'Mobile', os: 'iOS', country: 'India', city: 'Mumbai', created_at: new Date(Date.now() - 900000).toISOString() },
  { id: 'p3', visitor_id: 'v-2', path: '/', referrer: 'Direct', device_type: 'Desktop', os: 'Windows', country: 'India', city: 'Delhi', created_at: new Date(Date.now() - 800000).toISOString() },
  { id: 'p4', visitor_id: 'v-3', path: '/', referrer: 'https://google.com', device_type: 'Desktop', os: 'macOS', country: 'United States', city: 'New York', created_at: new Date(Date.now() - 600000).toISOString() },
  { id: 'p5', visitor_id: 'v-2', path: '/creators/aditi', referrer: '/', device_type: 'Desktop', os: 'Windows', country: 'India', city: 'Delhi', created_at: new Date(Date.now() - 300000).toISOString() }
];

// Helper to construct a chainable query builder mock
const createMockQueryBuilder = (tableName) => {
  const query = {
    insert: () => {
      const chain = {
        then: (onfulfilled) => Promise.resolve(onfulfilled({ error: null, data: null }))
      };
      return chain;
    },
    update: () => {
      const chain = {
        eq: () => chain,
        then: (onfulfilled) => Promise.resolve(onfulfilled({ error: null, data: null }))
      };
      return chain;
    },
    delete: () => {
      const chain = {
        eq: () => chain,
        then: (onfulfilled) => Promise.resolve(onfulfilled({ error: null, data: null }))
      };
      return chain;
    },
    select: () => {
      let resultData = [];
      if (tableName === 'contact_submissions') resultData = MOCK_CONTACTS;
      else if (tableName === 'swayai_chat_messages') resultData = MOCK_CHATS;
      else if (tableName === 'analytics_pageviews') resultData = MOCK_PAGEVIEWS;
      else if (tableName === 'creator_profiles') resultData = ROSTER;

      // Return a chainable object that implements then() so it can be awaited directly
      const chain = {
        order: () => chain,
        limit: () => chain,
        eq: (col, val) => {
          // If we query a specific profile by id (username) or password, filter it!
          if (col === 'id' || col === 'password') {
            resultData = resultData.filter(item => String(item[col]).toLowerCase() === String(val).toLowerCase());
          }
          return chain;
        },
        ilike: (col, val) => {
          if (col === 'id' && val) {
            const cleanVal = String(val).replace(/%/g, '').toLowerCase();
            resultData = resultData.filter(item => String(item[col]).toLowerCase() === cleanVal);
          }
          return chain;
        },
        or: () => chain,
        single: () => {
          const singleChain = {
            then: (onfulfilled) => {
              const item = resultData && resultData.length > 0 ? resultData[0] : null;
              return Promise.resolve(onfulfilled({ data: item, error: item ? null : { code: 'PGRST116', message: 'No rows found' } }));
            }
          };
          return singleChain;
        },
        then: (onfulfilled) => {
          return Promise.resolve(onfulfilled({ data: resultData, error: null }));
        }
      };
      return chain;
    }
  };
  return query;
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      from: (tableName) => createMockQueryBuilder(tableName)
    };
