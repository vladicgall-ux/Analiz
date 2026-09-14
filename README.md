# AI Репетитор — камера + ИИ + озвучка

Next.js (App Router) приложение: наведи камеру на текст, задачу или вопрос — ИИ распознает изображение, даст развёрнутый ответ на русском языке и озвучит его голосом.

## Структура проекта

```
app/
  layout.tsx            # корневой layout, метаданные
  page.tsx               # оркестратор экранов (welcome → camera → result)
  globals.css             # Tailwind + кастомные стили
  api/analyze/route.ts    # API-роут: принимает base64-изображение, зовёт Gemini, возвращает текст
components/
  WelcomeScreen.tsx        # экран приветствия
  CameraView.tsx            # видоискатель камеры, съёмка, переключение камер
  ResultView.tsx             # превью снимка, ответ ИИ, управление озвучкой
lib/
  formatAnswer.tsx            # парсинг ответа ИИ в абзацы/списки/заголовки
  useSpeech.ts                  # хук для window.speechSynthesis (ru-RU)
public/                          # статические файлы
.env.local.example                # пример переменных окружения
```

## Технологии

- **Next.js 14** (App Router, Route Handlers)
- **Tailwind CSS** — стили
- **lucide-react** — иконки
- **@google/genai** (Gemini 2.0 Flash) — мультимодальный анализ изображения
- **Web Speech API** (`window.speechSynthesis`) — озвучка ответа на русском

## Запуск локально

1. Установите зависимости:
   ```bash
   npm install
   ```
2. Скопируйте `.env.local.example` в `.env.local` и укажите свой ключ:
   ```bash
   cp .env.local.example .env.local
   ```
   Получить ключ Gemini API: https://aistudio.google.com/app/apikey
3. Запустите dev-сервер:
   ```bash
   npm run dev
   ```
4. Откройте [http://localhost:3000](http://localhost:3000). Для доступа к камере с телефона в локальной сети используйте HTTPS-туннель (например, `ngrok`) — браузеры запрещают `getUserMedia` на `http://` за пределами `localhost`.

## Деплой на Vercel

1. Запушьте репозиторий в GitHub/GitLab/Bitbucket.
2. Импортируйте проект на [vercel.com/new](https://vercel.com/new).
3. В настройках проекта (Settings → Environment Variables) добавьте:
   - `GEMINI_API_KEY` — ваш ключ Gemini API.
4. Задеплойте. Vercel автоматически определит Next.js и настроит сборку.

## Замена ИИ-провайдера

Логика вызова модели находится в `app/api/analyze/route.ts`. Чтобы использовать OpenAI вместо Gemini — замените клиент `GoogleGenAI` на `openai` SDK (`npm i openai`), передайте изображение как `image_url` с `data:` URI в `chat.completions.create` с моделью, поддерживающей vision (например, `gpt-4o`), и переменную окружения `OPENAI_API_KEY`.
