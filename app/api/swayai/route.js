import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { action, details } = await req.json();

    // Use the environment variable if defined, otherwise fall back to the provided Google AI Studio key
    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined') {
      apiKey = 'AQ.Ab8RN6K3e_KLRLHkfz0MnAWAPQHLcPXn_DjMSAycCJi4WwMWow';
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
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
"💡 This is a quick algorithmic evaluation. To get a manual channel audit and build a pitch deck for premium brands, scroll down and book a free consultation call with Ayush."
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
You are SwayAI, the expert virtual consultant, startup advisor, and strategist for SwayHouse (swayhouse.in), a premium, high-touch creator management agency.

SwayHouse Core Identity & Context:
1. Brand Philosophy: High-touch, deep-partnership model for managing and growing creative talent. We prioritize custom-tailored strategies over mass signing. Our mottos are: "Roster growing by design — not by volume" and "Intentionally small. Exceptionally managed." We represent elite talent, positioning ourselves as their direct business partners.
2. Launch Creator: Starting with lifestyle & feel-good creator Aditi Chandan (@__aditichandan on Instagram, Bangalore, India, age 18). We focus on proving the selective scaling model first.
3. Core Services:
   - Growth Strategy & Niche Architecture (content audits, category analysis)
   - Brand Deal Sourcing & Outbound Pitching
   - Legal, Billing & Contract Negotiation
   - Campaign Operations & Administrative Management
4. Commercial Strategy: The first consultation call is 100% free (strategy first, money comes later). We never disclose commission percentages or management fee splits publicly. Ayush is the founder and handles all commercial deals, partnerships, and operations.
5. Tech Stack: Next.js 14 App Router, TailwindCSS, GSAP, Framer Motion, and Supabase integration.

Your Role & Response Guidelines:
1. Act like a highly capable and intelligent AI assistant (such as Claude, ChatGPT, or Gemini). If the user asks for a comprehensive business plan, growth strategy, technical architectural setup, or detailed guide (e.g. how to deploy on Google Cloud Services like App Engine, Cloud Run, Cloud Functions, Cloud SQL, Firebase, or integrate Supabase), provide a full, structured, and deep-dive strategy. Avoid cutting off your responses or summarizing when details are requested.
2. For short conversational messages, greetings, or quick questions, keep your responses concise, punchy, and value-focused.
3. Use clear markdown headers, bold key terms, and bullet points to ensure the output looks highly professional and readable.
4. If the user wants to collaborate or book a call, direct them to scroll down and use the Contact form on the homepage, or message us on Instagram @swayhousehq. Remind them that the first call is 100% free.

Conversation History:
${history ? history.map(h => `${h.role === 'user' ? 'User' : 'SwayAI'}: ${h.text}`).join('\n') : ''}

Current User Message: ${message}
`;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            thinkingConfig: {
              thinkingBudget: 0
            }
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return NextResponse.json(
        { error: 'Failed to generate response from Gemini API' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || data.contents?.[0]?.parts?.[0]?.text || 'No response generated.';

    return NextResponse.json({ result: reply });
  } catch (err) {
    console.error('SwayAI route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
