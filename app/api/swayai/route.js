import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { action, details } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
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
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
    const reply = data.contents?.[0]?.parts?.[0]?.text || 'No response generated.';

    return NextResponse.json({ result: reply });
  } catch (err) {
    console.error('SwayAI route error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
