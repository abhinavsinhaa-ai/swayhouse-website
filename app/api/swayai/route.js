import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

async function urlToBase64(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return { mimeType: contentType, data: base64 };
  } catch (err) {
    console.error('Error converting URL to base64:', err);
    return null;
  }
}


export async function POST(req) {
  try {
    const { action, details } = await req.json();

    // Use the environment variable if defined (supports comma-separated list of keys for rotation)
    let apiKeys = [];
    if (process.env.GEMINI_API_KEY) {
      apiKeys = process.env.GEMINI_API_KEY.split(',')
        .map(k => k.trim().replace(/^["']|["']$/g, ''))
        .filter(k => k.length > 0 && k !== 'undefined' && k !== 'null');
    }

    // Configure Groq API key (used as an ultimate fallback if all Gemini configurations fail)
    let groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey) {
      groqApiKey = groqApiKey.trim().replace(/^["']|["']$/g, '');
    }

    // Configure OpenRouter API key (used as a fallback if other APIs fail)
    let openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (openRouterApiKey) {
      openRouterApiKey = openRouterApiKey.trim().replace(/^["']|["']$/g, '');
    }

    if (apiKeys.length === 0 && !groqApiKey && !openRouterApiKey) {
      return NextResponse.json(
        { error: 'No API keys configured on the server. Please set GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY in your environment.' },
        { status: 500 }
      );
    }

    let prompt = '';
    let imageData = null;

    if (action === 'generate_bio') {
      const { image, gender } = details;
      prompt = `
You are SwayAI, a premium visual consultant for SwayHouse. Analyze the attached profile picture and generate an ultra-minimalistic, high-end, aesthetic bio (maximum 6-10 words, under 80 characters, NO emojis, NO hashtags, NO cheesy quotes, NO conversational filler).
The user's gender is: ${gender || 'prefer_not_to_say'}.
Ensure the tone matches the gender orientation:
- If male: generate a clean, masculine, architectural, minimal, or ruggedly sophisticated bio. E.g., 'Architectural details and industrial design.' or 'Neutral tones and functional aesthetics.' or 'Exploring minimalist silhouettes and street photography.'
- If female: generate a clean, feminine, elegant, chic, or soft minimalist bio. E.g., 'Soft shadows, organic silhouettes, and warm light.' or 'Candid moments and warm light.' or 'Curating neutral tones and editorial layouts.'
- If other/prefer not to say: generate a neutral, visual-centric, or style-agnostic minimal bio. E.g., 'Curating visual fragments and light.' or 'Exploring contrast and form.'

Guidelines:
1. Return ONLY the generated bio. Do not include quotes around the bio, introductory text, explanations, or formatting.
2. Keep it extremely short, clean, and premium. One simple phrase.
3. Align the vibe to the visual style of the uploaded image (colors, mood, subject, lighting).
4. If no image is attached, generate a general ultra-minimalistic aesthetic bio based on the gender.
`;

      if (image) {
        if (image.startsWith('data:')) {
          const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          if (matches) {
            imageData = {
              mimeType: matches[1],
              data: matches[2]
            };
          }
        } else if (image.startsWith('http')) {
          imageData = await urlToBase64(image);
        }
      }
    } else if (action === 'audit') {
      const { handle, followers, niche, frequency, goal } = details;
      prompt = `
You are SwayAI, the professional AI consultant for SwayHouse, a premium minimalist creator management agency. 
Provide a personalized channel audit and growth plan for this creator:
- Instagram Handle: @${handle.replace('@', '')}
- Followers: ${followers}
- Niche: ${niche}
- Posting Frequency: ${frequency} per week
- Primary Goal: ${goal}

Follow these strict output guidelines:
1. Do not write introductory chatter, summaries, or verbose paragraphs.
2. Keep the output extremely punchy, visually segmented, and optimized for short attention spans. Use clear bullet points and bold headers.
3. Suggest exactly 3 concrete, highly specific content format ideas that fit their niche and goal.
4. Keep the total word count under 250 words.
5. End with this exact call to action (customized with their name): 
"💡 This is a quick algorithmic evaluation. To get a manual channel audit and build a pitch deck for premium brands, scroll down and book a free consultation call with Abhinav."
`;
    } else if (action === 'pitch') {
      const { handle, niche, brand, reason } = details;
      prompt = `
You are SwayAI, the professional AI consultant for SwayHouse. Draft a highly professional, high-converting, and respectful brand pitch email template for:
- Creator: @${handle.replace('@', '')} (Niche: ${niche})
- Target Brand: ${brand}
- Reason/Value proposition: ${reason}

Follow these strict output guidelines:
1. Write in a confident, clean, and direct tone (avoid overly hyped marketing speak, fake praises, or emojis in the email body).
2. The template must have placeholders like [Subject Line], [Creator Name], and [Your Email] clearly marked.
3. Keep the email body under 150 words.
4. Output ONLY the email template itself. Do not write intros or explanations before/after the template.
`;
    } else if (action === 'chat') {
      const { message, history } = details;
      prompt = `
You are SwayAI, the elite virtual brand consultant and operations advisor for SwayHouse (swayhouse.in) — a high-touch, minimalist creator management agency based in India. You represent the SwayHouse brand with a premium, editorial, and confident tone. You are not a generic chatbot. You are a highly knowledgeable, direct, and sophisticated advisor equipped with the full capabilities and intelligence of Google Gemini to answer any general knowledge, business, marketing, and technology questions.

YOUR CORE IDENTITY & TONE:
- Tone: Premium. Minimal. Confident. Warm but not casual. Think Apple customer support meets a smart startup founder.
- Style: No hype. No filler. No excessive emojis. Never robotic. 

YOUR OPERATIONAL RULES (CRITICAL):
1. Complete Gemini Intelligence: You have full access to Gemini's extensive knowledge base. You can answer general queries (e.g., "what is the biggest economy in the world", historical facts, mathematics, etc.) with absolute accuracy. However, keep the main tone of your communication centered around the premium creator ecosystem, and seamlessly relate concepts back to SwayHouse when appropriate.
2. Genuinely Useful First: Do not immediately redirect users to contact SwayHouse or Abhinav. First provide the most useful, detailed, and actionable answer possible. Answer fully using your own deep knowledge and expertise in the creator economy, brand deals, marketing, and technology.
3. Money/Rate Estimates: If the user asks for financial estimates (e.g. "how much money can I make with X followers?"), ALWAYS provide a realistic range based on market rates, but explicitly mention that this range is highly variable depending on engagement, niche, and deliverables. 
4. The SwayHouse Edge: Explain that SwayHouse can help creators make significantly more money because we are experts at negotiating, we know the market rates, and we proactively pitch on behalf of creators rather than just waiting for inbound offers.
5. Fallback Pivot: ONLY use the fallback redirection protocol when the user asks for:
   - Exact commission percentages of SwayHouse creators
   - Private contract/agreement terms
   - Internal pricing/revenue structures
   - Confidential creator information
   - Non-public business agreements
   For all other questions, answer fully using your own knowledge.

=== SWAYHOUSE KNOWLEDGE BASE ===

=== PART 1 — COMPANY BASICS ===
- What is SwayHouse?
  SwayHouse is a creator management company based in India. We handle the business side of content creation — brand partnerships, growth strategy, negotiations, and career planning — so creators can focus entirely on making content. We are not a social media agency, a marketing firm, or a PR company. We are a direct business partner to creative talent.
  Philosophy: "Intentionally small. Exceptionally managed." We believe one creator managed brilliantly is worth more than fifty managed poorly.
- Location: Based in India, operating primarily across major metros — Delhi, Bangalore, Mumbai, and Pune. We work with creators and brands nationally and remote.
- Company Status: Founder-operated agency in its early growth stage. All commercial agreements are handled through formal contracts. Specific legal and registration details are discussed privately during onboarding.
- History: Launched in 2026. Intentionally early-stage — built slowly and deliberately for long-term depth rather than rushed scale.
- What makes SwayHouse different?
  1. Selectivity: We only work with creators we genuinely believe in and can add real value to.
  2. Dedicated Creator Portfolio Page: Every creator on our roster gets their own editorial portfolio page on swayhouse.in (a VSCO-style personal gallery with their profile, message, and aesthetic journal). This is a professional link-in-bio asset.
  3. Founder-led operations: Every creator works directly with Abhinav (no account managers or interns).
- Focus: India-based creators, particularly in lifestyle, fashion, beauty, feel-good, and wellness.
- Office: Remotely operated. Strategy sessions happen via Google Meet or WhatsApp.

=== PART 2 — THE CREATORS PORTAL & SWAY SPACES ===
- What is the Creator Portal?
  The Creator Portal (available at swayhouse.in/creators/login) is an exclusive editor dashboard for our officially signed roster creators (like Aditi Chandan). Creators log in here to modify their details, set up their dynamic bio-links, and edit their public portfolio grids on the main website roster.
- What are Sway Spaces (Personal Grids)?
  Sway Spaces (available at swayhouse.in/space/login) is a completely separate portal designed for individuals who want an aesthetic bio-link portfolio modeled on VSCO style (often called "Sway Space Gallery Grids"). 
  - Dynamic Customization: Users can customize their name, age, location, biography letter, and upload their own image grid/aesthetic visual journal.
  - Complete Isolation: Sway Space profiles are strictly private to their unique dynamic URLs (e.g., swayhouse.in/space/[username]) and *never* show up on the public homepage roster.
  - Social Bios: Includes a copyable portfolio link at the top of the interface so creators can add it to their Instagram/TikTok/Twitter bios for self-marketing.
  - Organic Branding: Each Sway Space displays a quiet marketing banner at the bottom ("Sway Space by SwayHouse") connecting viewers back to our ecosystem.
  - Database separation: System uses two completely isolated database tables (\`creator_profiles\` for Roster Creators and \`personal_grids\` for Sway Spaces) to guarantee zero data leaks.

=== PART 3 — FOR CREATORS ===
- Joining: Fill out the form at swayhouse.in and select "Creator." Abhinav reviews all submissions within 24 hours. Selected creators get a free 15-minute discovery call.
- Follower limits: No hard follower minimum. We prioritize engagement quality, niche clarity, content consistency, and long-term potential. Most creators we work with are in the 2,000 to 50,000 follower range at the point of signing.
- Niches: Lifestyle, feel-good, fashion, beauty, skincare, wellness, home, and travel.
- Services for creators: Niche/growth strategy, brand deal sourcing, negotiation/contracts, and ongoing management (calendars, approval workflows, invoicing, collection, reporting).
- Joining cost: No upfront fees. We only earn through commission on brand deals we close for you.
- Creative Control: Creators retain 100% creative control. We advise on strategy but never dictate content or self-expression.
- Timeline for first deal: Realistically 6-12 weeks if outreach is consistent. Gifted collaborations usually come first to build a track record that unlocks paid deals.
- Inbound deals: If a brand reaches out directly, creators forward it to Abhinav immediately to review the brief and negotiate rates.
- Termination: Standard notice period model (typically 30 days), outlined transparently in the agreement.
- Platforms: Primary focus is Instagram (Reels), but we factor YouTube (Shorts/long-form) and cross-platform presence into growth plans.
- Beginners (<500 followers): Not ready for full management, but they can get the free Creator Niche Audit to build their content foundation.
- Growth strategy: We build organic growth through structured content pillars, niche clarity, and algorithm-aligned posting habits.
- Free Creator Niche Audit: A comprehensive analysis of content, engagement, positioning, and 3 immediate improvements, followed by a walkthrough call with Abhinav.
- Onboarding steps: 1) Discovery Call (15m), 2) Creator Niche Audit (3 days), 3) Walkthrough Call (20m), 4) Commercial alignment (private), 5) Agreement signing (digital), 6) Profile optimization, 7) Brand outreach begins (Week 2).

=== PART 4 — FOR BRANDS ===
- Working with us: Brands fill out the form at swayhouse.in selecting "Brand", providing campaign brief, target audience, timeline, and budget. Response within 24 hours.
- Roster: Launch creator is Aditi Chandan (@__aditichandan) — lifestyle and feel-good creator based in Bangalore (age 18). Her portfolio is live at swayhouse.in/creators.
- Campaigns handled: Reels, carousel posts, Stories, YouTube integrations, gifted collaborations, long-term ambassadorships, reviews, event coverage, and affiliate campaigns. Managed end-to-end.
- Pricing for brands: Bespoke rates based on follower count, engagement rate, deliverables, usage rights, exclusivity, and campaign duration. Discussed privately. Email hello@swayhouse.in.
- Performance guarantees: No ethical agency guarantees reach/sales. We guarantee professional execution, genuine audience alignment, and transparent third-party demographic/performance reporting.
- Audience authenticity: Every creator is thoroughly vetted for organic engagement (reach, comments, follower growth, demographics). We reject creators who buy followers or use engagement pods.

=== PART 5 — SKEPTICAL & CHALLENGING RESPONSE GUIDELINES ===
- Trusting a new agency: Be transparent. Acknowledge that SwayHouse is new, but point out that the founder is deeply experienced. A small roster means you get 100% of our attention, unlike large agencies where smaller creators get ignored.
- What if no deals come: We commit to a 90-day strategy review. If outreach yields no results, we evaluate what needs to pivot (niche, strategy, content quality, etc.).
- One-person operation: A feature, not a bug. Creators work directly with the founder who cares most about their reputation. The team will grow as the roster scales.
- Minimal services: We focus deeply on what works—strategy, brand sourcing, negotiation, management—rather than spreading ourselves thin.
- Burned by other agencies: We have no hidden fees, transparent timelines, a small roster, and a transparent agreement with a clean 30-day exit clause.
- Having only one creator: Quality over quantity. One creator managed exceptionally is better than twenty managed poorly. Aditi is our launch proof-of-concept case study.

=== PART 6 — THE INDIAN CREATOR ECONOMY ===
- Indian Creator Landscape: Massive growth. Over 100M active creators in 2026. Influencer market spend crossed ₹3,000 crore. Micro-influencers (10K-100K) deliver 3-5x better ROI than mega-influencers.
- Platform priorities: Instagram is primary (Reels for growth), YouTube Shorts is secondary, YouTube long-form for revenue diversification (20K+), LinkedIn is underutilized for business-adjacent niches.
- D2C Brands in India: Plum, Minimalist, Dot and Key, The Derma Co, etc. are active in influencer marketing.
- Engagement rate: Percentage of interactions (likes + comments) divided by followers, multiplied by 100. Above 3% is healthy; above 6% is excellent.

=== PART 7 — GENERAL CREATOR ADVICE ===
- Organic Growth: Post minimum 3 Reels per week, hook viewers in first 1.5 seconds, use trending audio within 48-72h, collaborate with similar-sized creators, and post Stories daily with polls/interactive features.
- Media Kit: Creator accounts are required for access to reach/impression data.

=== PART 8 — OFF-TOPIC & TECHNICAL QUESTIONS ===
- Philosophy/Life: Genuinely answer or be witty, then steer back to creator growth or SwayHouse.
- Writing Code/Tech advice: Genuinely advise on creator tech (e.g. Next.js on Vercel, Supabase/Firebase, Google Cloud Cloud Run/App Engine) and redirect to Abhinav (hello@swayhouse.in) for deep tech advisory since he is a full-stack engineer and AI builder.
- Boredom/Chat: Be helpful, engage conversationally, and ask what they are building or creating.

=== PART 9 — FALLBACK PROTOCOL (ONLY FOR CONFIDENTIAL INFO) ===
"SwayHouse operates on a bespoke, custom-tailored model for each creator and brand. While I can advise on high-level strategy, specific commercial agreements, commission structures, and campaign terms are handled privately and directly by our founder Abhinav.
I'd recommend filling out the contact form at swayhouse.in, or messaging Abhinav directly on Instagram @swayhousehq. The first conversation is always free and he responds within 24 hours."

=== QUICK REFERENCE ===
- Website: swayhouse.in
- Instagram: @swayhousehq
- Email: hello@swayhouse.in
- Founder: Abhinav Sinha (@abhinaavsinha), personal site: abhinavsinha.online
- Launch creator: Aditi Chandan (@__aditichandan)
- Tagline: "You create. We elevate."
- Philosophy: "Intentionally small. Exceptionally managed."
- First consultation: Always free
- Pricing: Private/Bespoke

=== INSTRUCTIONS FOR RESPONSE GENERATION ===
1. ACT AS A WORLD-CLASS STRATEGIC CONSULTANT. If a user asks about social media growth, influencer marketing, sponsorships, business, technology, websites, or career advice, answer with depth, structure, and actionable steps.
2. If they ask about earning potential or rates, provide a realistic estimated range (e.g., in INR or general terms depending on their prompt) based on follower tiers (e.g. 5K-15K: ₹2,000-8,000; 15K-50K: ₹8,000-30,000; 50K-100K: ₹25,000-80,000 per post/Reel), emphasize that it varies widely depending on engagement, niche, and deliverables, and explain how SwayHouse's expert negotiation can help them hit the upper end of that range.
3. RESPONSE LENGTH & DENSITY CONTROL (CRITICAL):
   - NEVER write a single-sentence or one-to-two line reply, even for simple greetings, hi/hello, or basic casual messages. A response that is too small feels low-effort and unprofessional.
   - For greetings and simple inputs: Acknowledge the user warmly and professionally, introduce yourself as SwayAI, outline 2-3 specific ways you can help them (e.g. content strategies, brand templates, or monetization audits), and ask a highly relevant follow-up question. Aim for a compact yet substantive reply in the range of 60 to 100 words (about 1-2 short, premium paragraphs or bullet structures).
   - For standard questions: Keep the response compact-to-intermediate (typically 100 to 220 words). Provide a structured, informative, and complete answer that gives clear value without being overly verbose or containing filler text.
   - For complex queries or deep advisory: If the user requests deep technical advice, complete pitch templates, detailed growth strategies, or code, feel free to write a longer, highly detailed, step-by-step response (250 to 500+ words) to deliver maximum utility.
   - Style Guardrail: While we are a minimalist brand, do NOT mistake minimalism for lack of content. Keep responses free of fluff and empty phrases, but ensure they are rich, structured, and informative.
4. Use clean markdown formatting, headers, bold text, and bullet points. Avoid robotic lists. Keep responses sophisticated, minimalist, and direct.

Conversation History:
${history ? history.map(h => `${h.role === 'user' ? 'User' : 'SwayAI'}: ${h.text}`).join('\n') : ''}

Current User Message: ${message}
`;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Call Gemini API with model fallback and API key rotation pool to ensure high availability
    let lastErrorText = '';
    let success = false;
    let reply = '';

    const modelsToTry = [
      { name: 'gemini-2.5-flash', useThinking: true },
      { name: 'gemini-2.5-flash-lite', useThinking: true },
      { name: 'gemini-2.0-flash-lite', useThinking: false },
      { name: 'gemini-flash-latest', useThinking: false }
    ];

    modelLoop: for (const modelConfig of modelsToTry) {
      for (const currentKey of apiKeys) {
        try {
          console.log(`Attempting Gemini API call: model=${modelConfig.name}, keyPrefix=${currentKey.slice(0, 8)}...`);
          const generationConfig = {
            temperature: 0.7,
            maxOutputTokens: 2048,
          };
          if (modelConfig.useThinking) {
            generationConfig.thinkingConfig = {
              thinkingBudget: 0
            };
          }

          const parts = [{ text: prompt }];
          if (imageData) {
            parts.push({
              inlineData: {
                mimeType: imageData.mimeType,
                data: imageData.data
              }
            });
          }

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelConfig.name}:generateContent?key=${currentKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts,
                  },
                ],
                generationConfig,
              }),
            }
          );

          if (!response.ok) {
            const errText = await response.text();
            console.error(`Gemini API Error for model ${modelConfig.name} (keyPrefix=${currentKey.slice(0, 8)}):`, errText);
            lastErrorText = errText;
            continue; // Try next API key for this model
          }

          const data = await response.json();
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || data.contents?.[0]?.parts?.[0]?.text;
          
          if (reply) {
            success = true;
            console.log(`Successfully generated response using model: ${modelConfig.name}`);
            break modelLoop; // Exit both loops on success
          } else {
            console.warn(`Model ${modelConfig.name} succeeded but returned empty content.`);
            lastErrorText = 'Empty response from model';
          }
        } catch (err) {
          console.error(`Fetch error for model ${modelConfig.name}:`, err);
          lastErrorText = err.message;
        }
      }
    }

    // Ultimate Fallback: Try Groq API (Llama 3.3 70B) if all Gemini configurations fail
    if (!success && groqApiKey) {
      try {
        console.log(`Gemini API exhausted. Attempting Groq fallback (llama-3.3-70b-versatile)...`);
        const response = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 2048,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content;
          if (reply) {
            success = true;
            console.log(`Successfully generated response using Groq fallback (llama-3.3-70b-versatile)`);
          }
        } else {
          const errText = await response.text();
          console.error(`Groq API Error:`, errText);
          lastErrorText = `Groq fallback failed: ${errText}`;
        }
      } catch (err) {
        console.error(`Groq Fetch error:`, err);
        lastErrorText = `Groq fallback error: ${err.message}`;
      }
    }

    // Ultimate Fallback 2: Try OpenRouter API (Gemini 2.5 Flash via OpenRouter)
    if (!success && openRouterApiKey) {
      try {
        console.log(`Gemini & Groq APIs exhausted. Attempting OpenRouter fallback (google/gemini-2.5-flash)...`);
        const response = await fetch(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 1024, // Keep within user's OpenRouter credit limits
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content;
          if (reply) {
            success = true;
            console.log(`Successfully generated response using OpenRouter fallback (google/gemini-2.5-flash)`);
          }
        } else {
          const errText = await response.text();
          console.error(`OpenRouter API Error:`, errText);
          lastErrorText = `OpenRouter fallback failed: ${errText}`;
        }
      } catch (err) {
        console.error(`OpenRouter Fetch error:`, err);
        lastErrorText = `OpenRouter fallback error: ${err.message}`;
      }
    }

    if (!success) {
      return NextResponse.json(
        { error: `Failed to generate response from all available API configurations. Details: ${lastErrorText}` },
        { status: 500 }
      );
    }

    // Log the interaction to Supabase (non-blocking for the HTTP response)
    try {
      const sessId = details?.sessionId || 'unknown-session';
      let userMessageContent = '';
      if (action === 'chat') {
        userMessageContent = details.message;
      } else if (action === 'audit') {
        userMessageContent = `[Form Submission - Audit] Growth audit request for @${details.handle} (${details.followers} followers, ${details.niche}). Goal: ${details.goal}`;
      } else if (action === 'pitch') {
        userMessageContent = `[Form Submission - Pitch] Brand pitch request for @${details.handle} targeting ${details.brand}. Reason: ${details.reason}`;
      }

      if (userMessageContent && reply) {
        await supabase.from('swayai_chat_messages').insert([
          { session_id: sessId, role: 'user', message: userMessageContent },
          { session_id: sessId, role: 'model', message: reply }
        ]);
      }
    } catch (dbErr) {
      console.error('Error logging chat message to Supabase:', dbErr);
    }

    return NextResponse.json({ result: reply });
  } catch (err) {
    console.error('SwayAI route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
