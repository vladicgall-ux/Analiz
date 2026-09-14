import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT =
  "Ты умный ассистент-репетитор. Внимательно проанализируй текст на изображении " +
  "(вопрос, задачу, тест). Если на изображении тест с вариантами ответа (пронумерованными " +
  "или помеченными буквами/цифрами, например 1, 2, 3, 4) — ответь ТОЛЬКО номером или " +
  "буквой правильного варианта, без объяснений, без хода решения, без лишних слов. " +
  "Например, если правильный вариант — второй, ответ должен быть просто «2». Если " +
  "изображение не является тестом с вариантами (обычная задача или открытый вопрос) — " +
  "дай точный и развёрнутый ответ на русском языке.";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Сервер не настроен: отсутствует GEMINI_API_KEY. Добавьте переменную окружения на Vercel.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { image } = body as { image?: string };

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Изображение не передано." },
        { status: 400 }
      );
    }

    const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Некорректный формат изображения." },
        { status: 400 }
      );
    }
    const [, mimeType, base64Data] = match;

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const text = response.text;

    if (!text) {
      return NextResponse.json(
        { error: "ИИ не смог распознать текст на изображении. Попробуйте сделать снимок чётче." },
        { status: 422 }
      );
    }

    return NextResponse.json({ answer: text });
  } catch (err: unknown) {
    console.error("Analyze API error:", err);
    const message =
      err instanceof Error ? err.message : "Неизвестная ошибка сервера.";
    return NextResponse.json(
      { error: `Ошибка при обращении к ИИ: ${message}` },
      { status: 500 }
    );
  }
}
