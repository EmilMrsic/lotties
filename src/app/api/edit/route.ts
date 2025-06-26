import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt, animation } = await req.json();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that edits Lottie JSON according to instructions. Respond ONLY with the updated JSON object.',
      },
      {
        role: 'user',
        content: `JSON:${JSON.stringify(animation)}\nPrompt:${prompt}`,
      },
    ],
  });

  const content = completion.choices[0].message.content || '{}';
  try {
    return NextResponse.json(JSON.parse(content));
  } catch {
    return NextResponse.json(
      { error: 'Invalid response from OpenAI', raw: content },
      { status: 500 }
    );
  }
}