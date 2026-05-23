import type { NextRequest } from 'next/server';

import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const {
    apiKey: key,
    model = 'deepseek-v4-flash',
    prompt,
    system,
  } = await req.json();

  const apiKey = key || process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing ai gateway API key.' },
      { status: 401 }
    );
  }

  try {
    const deepseek = createOpenAI({ 
      apiKey, 
      baseURL: 'https://api.deepseek.com'
    });

    const result = await generateText({
      abortSignal: req.signal,
      maxOutputTokens: 50,
      model: deepseek('deepseek-v4-flash'),
      prompt,
      system,
      temperature: 0.7,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
