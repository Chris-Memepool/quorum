# Quorum

Three minds. One answer.

A self-hosted AI gateway that lets you chat with multiple AI models using your own API keys. Your keys stay local, your data stays private.

## Features

- **Multi-model support:** OpenAI (GPT-4o, GPT-4 Turbo), Anthropic (Claude 3.5 Sonnet, Claude 3 Opus), Google (Gemini 1.5 Pro/Flash)
- **Self-hosted:** Run locally, no data leaves your machine except to the AI providers
- **Your keys:** Use your own API keys, stored in your browser's localStorage
- **Clean UI:** Modern dark interface with model switching

## Screenshots

[screenshots here]

## Quick Start

```bash
git clone https://github.com/[your-username]/quorum.git
cd quorum
npm install
npm run dev
```

Open http://localhost:3000

## Getting API Keys

You'll need at least one API key:

- **OpenAI:** https://platform.openai.com/api-keys
- **Anthropic:** https://console.anthropic.com/settings/keys
- **Google:** https://aistudio.google.com/app/apikey

## Tech Stack

- Next.js 15
- Vercel AI SDK
- Tailwind CSS
- TypeScript

## License

MIT
