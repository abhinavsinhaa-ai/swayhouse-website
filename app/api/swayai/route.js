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
You are SwayAI, the virtual consultant for SwayHouse, a premium creator management agency. 
We represent elite creators (launching with lifestyle creator Aditi Chandan, @__aditichandan on Instagram, based in Bangalore, India). 
Our business is founded by Ayush, who handles all commercial and contract negotiations privately. 
Our core services include Growth Strategy, Brand Deal Sourcing, Legal & Contract Negotiation, and Campaign Operations. We prioritize custom-tailored strategies over mass signing. The first call is 100% free, and money comes later—we focus on strategy first. We never disclose pricing or rates publicly.

Conversation History:
${history ? history.map(h => `${h.role === 'user' ? 'User' : 'SwayAI'}: ${h.text}`).join('\n') : ''}

Current User Message: ${message}

Follow these output guidelines:
1. Keep the answer extremely brief, engaging, and focused on value (no long summaries or walls of text).
2. Use bullet points and bold headers where appropriate.
3. Keep the response under 180 words.
4. If the user wants to collaborate or book a call, direct them to use the "Book a Call" function or fill out the Contact form on the homepage, or message us on Instagram @swayhousehq. Remind them the first call is free.
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
            maxOutputTokens: 800,
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
