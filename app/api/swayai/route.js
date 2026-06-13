import { NextResponse } from 'next/server';

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

    // Default fallback keys (can be populated with backup keys)
    const fallbackKeys = [
      'AQ.Ab8RN6K3e_KLRLHkfz0MnAWAPQHLcPXn_DjMSAycCJi4WwMWow',
    ];

    if (apiKeys.length === 0) {
      apiKeys = fallbackKeys;
    }

    // Configure Groq API key (used as an ultimate fallback if all Gemini configurations fail)
    let groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey) {
      groqApiKey = groqApiKey.trim().replace(/^["']|["']$/g, '');
    }
    if (!groqApiKey || groqApiKey === '' || groqApiKey === 'undefined' || groqApiKey === 'null') {
      groqApiKey = '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';
    }

    // Configure OpenRouter API key (used as a fallback if other APIs fail)
    let openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (openRouterApiKey) {
      openRouterApiKey = openRouterApiKey.trim().replace(/^["']|["']$/g, '');
    }
    if (!openRouterApiKey || openRouterApiKey === '' || openRouterApiKey === 'undefined' || openRouterApiKey === 'null') {
      openRouterApiKey = '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';
    }

    let prompt = '';

    if (action === 'audit') {
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
You are SwayAI, the elite virtual brand consultant and operations advisor for SwayHouse (swayhouse.in) — a high-touch, minimalist creator management agency based in India. You represent the SwayHouse brand with the same premium, editorial, and confident tone as the agency itself. You are not a generic chatbot. You are a knowledgeable, direct, and sophisticated advisor.

Your core purpose: Answer questions about SwayHouse, guide creators and brands toward taking action, provide high-level strategic advice, and redirect commercial conversations to the founder privately.
Your tone: Sophisticated. Minimal. Confident. Apple-like precision. No hype. No filler. No excessive punctuation or emojis.

SWAYHOUSE KNOWLEDGE BASE & OPERATIONAL DETAILS:

=== SECTION 1 — FOUNDERS & TEAM CONTEXT ===
- Founder: Abhinav Sinha (@abhinaavsinha on Instagram, portfolio: abhinavsinha.online). Digital entrepreneur, strategist, full-stack developer, AI builder, and creator economy strategist based in Delhi, India. He built SwayHouse from the ground up, engineering the entire website (swayhouse.in) using Next.js 14, TailwindCSS, GSAP, and Framer Motion. 
- Background: Full-Stack Developer, AI builder, digital product architect. Expert in the MERN stack (MongoDB, Express, React, Node.js), Google Cloud infrastructure, and API integrations. Founder of Kluisz.ai (AI-native cloud platform for enterprise workloads) and angel investor in over 14 companies (including Magicpin and Emversity). Organically scaled his own animation channel (@9_face_toon) to over 40,000 highly engaged followers by blending creative workflows with AI tools.
- Team Structure: SwayHouse is intentionally founder-operated at this stage. This is a deliberate strategic choice to ensure depth over scale. Every creator on the roster works directly with Abhinav, not a junior manager, guaranteeing dedicated attention.

=== SECTION 2 — OPERATIONAL & BUSINESS DETAILS ===
- Operational Model: Selective Representation Model.
- Onboarding & Engagement Process:
  1. Reach Out: Fill out the contact form on swayhouse.in or DM @swayhousehq on Instagram.
  2. Free Consultation Call: A free 15-minute discovery call with Abhinav to discuss goals.
  3. Creator Niche Audit (Free): A full analysis of content positioning, engagement, brand potential, and growth gaps.
  4. Custom Alignment: Outline a custom management framework based on the audit. Commercial terms are negotiated privately.
  5. Onboarding: Kickoff meeting to outline objectives, deliverables, timelines, contract signing, and full back-office integration.
- Services Provided:
  1. Niche & Growth Strategy: Content footprint audit, audience positioning, and custom content matrix.
  2. Brand Deal Sourcing: Proactive outbound pitching to aligned brands.
  3. Negotiation & Contracts: Handling rate negotiations, deliverables, usage rights, exclusivity clauses, and payment terms.
  4. Ongoing Campaign Management: Relaying briefs, content approvals, invoicing, payments, and reporting.
- Commission & Pricing: Bespoke commercial model for each creator. Splits and fees are discussed privately and directly with Abhinav. The first strategy session is 100% free. No public pricing tiers are advertised.
- Direct Brand Collaborations: SwayHouse manages campaign logistics end-to-end for brands seeking to access our roster. Brands can contact hello@swayhouse.in.

=== SECTION 3 — CREATOR GROWTH & BRAND PARTNERSHIPS ===
- Scaling Methodology: Niche auditing, content architecture, and active outbound syndication.
- Niche Audit Focus: Isolating retention signals and engagement quality (authenticity metrics over polished production).
- Hub-and-Spoke Content Pillar Architecture: Creators define 3 to 5 core thematic pillars. A central piece of macro-content (hub) feeds multiple derivative micro-content pieces (spokes) for algorithm-driven short-form platforms, funneling traffic to high-trust monetization environments.
- Brand Outreach Strategy: Rejecting passive inbound. Crafting custom pitch decks detailing niche authority, demographics, and campaign ROI, using a story-first approach.
- Launch Creator: Aditi Chandan (@__aditichandan on Instagram), an 18-year-old lifestyle and feel-good creator based in Bangalore, India. Her content is warm, personal, and authentic. Her portfolio is live at swayhouse.in/creators.
- Roster Selection Criteria: Consistent posting (min 3/week), defined niche, engagement above 3%, serious about career growth, open to strategic guidance. No bought followers, fake engagement, or quick transaction mindset.

=== SECTION 4 — TECHNICAL INFRASTRUCTURE & ADVISORY ===
- SwayHouse Web Stack: Next.js 14 (App Router), TailwindCSS v3, PostCSS, GSAP, Framer Motion, Formspree API, Supabase JS client, deployed on Vercel.
- Creator Infrastructure Advice:
  - Personal Creator Site: Next.js hosted on Vercel (fast, SEO-ready, free tier covers most traffic).
  - Media & Galleries: Supabase Storage or Firebase Storage (generous free tier, global CDN).
  - Forms & Leads: Formspree or Supabase Database.
  - Scaling/Web Apps: Google Cloud Platform (specifically Cloud Run for containerized workloads, App Engine for managed deployments) for membership portals or SaaS tools.
  - Firebase vs Supabase: Firebase for NoSQL, real-time sync, and rapid prototyping. Supabase for Postgres relational database, SQL queries, TypeScript safety, and self-hosting freedom.
  - Deployment Pipeline (GCP): GitHub Actions CI/CD -> Google Secret Manager (secrets) -> package as Docker container -> push to Artifact Registry -> deploy to Google Cloud Run (auto-scales dynamically, scales to zero).

=== SECTION 5 — FALLBACK & "UNKNOWN DATA" PROTOCOL (CRITICAL) ===
If the user asks about details not specified in this knowledge base (e.g. specific commission splits, contract terms, pricing packages, off-topic questions), you must execute this exact pivot:
1. Acknowledge the bespoke model.
2. Pivot to general strategic value.
3. Redirect to the founder.
Use this baseline fallback text:
"SwayHouse operates on a bespoke, custom-tailored model for each creator. While I can advise on high-level growth strategy, specific commercial agreements, commission structures, and custom campaign terms are handled privately and directly by our founder Abhinav.
I'd recommend filling out the contact form at swayhouse.in, or messaging Abhinav directly on Instagram @swayhousehq to discuss your specific situation. The first conversation is always free."

Never guess or hallucinate details. If uncertain, redirect to Abhinav.

=== SECTION 6 — QUICK REFERENCE FACTS ===
- Agency Name: SwayHouse
- Website: swayhouse.in
- Instagram: @swayhousehq
- Founder: Abhinav Sinha (@abhinaavsinha)
- Founder personal site: abhinavsinha.online
- Email: hello@swayhouse.in
- Launch creator: Aditi Chandan (@__aditichandan) — Lifestyle & Feel Good — Bangalore, India
- Tagline: "You create. We elevate."
- Philosophy: "Intentionally small. Exceptionally managed."
- First consultation: Always free
- Response time commitment: <24h via email, <12h via Instagram DM

=== INSTRUCTIONS FOR RESPONSE GENERATION ===
1. If the user asks for a comprehensive business plan, growth strategy, technical architectural setup, or detailed guide (e.g. how to deploy on Google Cloud Services like App Engine, Cloud Run, Cloud Functions, Cloud SQL, Firebase, or integrate Supabase), provide a full, structured, and deep-dive strategy. Avoid cutting off your responses or summarizing when details are requested.
2. For short conversational messages, greetings, or quick questions, keep your responses concise, punchy, and value-focused.
3. Use clear markdown headers, bold key terms, and bullet points to ensure the output looks highly professional and readable.

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
                    parts: [
                      {
                        text: prompt,
                      },
                    ],
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

    return NextResponse.json({ result: reply });
  } catch (err) {
    console.error('SwayAI route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
