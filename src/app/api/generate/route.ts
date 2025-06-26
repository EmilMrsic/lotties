import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates valid Lottie JSON. Respond ONLY with a JSON object for the animation.',
      },
      {
        role: 'user',
        content: prompt,
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