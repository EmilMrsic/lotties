import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Generate a complete Lottie JSON animation. Respond ONLY with JSON.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const content = completion.choices[0].message.content || '{}';
  return NextResponse.json(JSON.parse(content));
}
