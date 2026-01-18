import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export const maxDuration = 30

const MODEL_MAP: Record<string, { providerName: "openai" | "anthropic" | "google"; model: string }> = {
  "GPT-4o": { providerName: "openai", model: "gpt-4o" },
  "GPT-4 Turbo": { providerName: "openai", model: "gpt-4-turbo" },
  "o1": { providerName: "openai", model: "o1" },
  "o1-mini": { providerName: "openai", model: "o1-mini" },
  "Claude Sonnet": { providerName: "anthropic", model: "claude-3-5-sonnet-20241022" },
  "Claude Opus": { providerName: "anthropic", model: "claude-3-opus-20240229" },
  "Gemini 1.5 Flash": { providerName: "google", model: "gemini-1.5-flash" },
  "Gemini 1.5 Pro": { providerName: "google", model: "gemini-1.5-pro" },
}

export async function POST(req: Request) {
  try {
    const { messages, apiKeys, selectedModel }: { 
      messages: UIMessage[]
      apiKeys: { openai?: string; anthropic?: string; google?: string }
      selectedModel: string
    } = await req.json()

    if (!selectedModel) {
      return new Response(JSON.stringify({ error: "No model selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const modelConfig = MODEL_MAP[selectedModel]
    if (!modelConfig) {
      return new Response(JSON.stringify({ error: "Invalid model selected" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get the appropriate API key and create provider
    let provider: ReturnType<typeof createOpenAI> | ReturnType<typeof createAnthropic> | ReturnType<typeof createGoogleGenerativeAI>
    let apiKey: string

    if (modelConfig.providerName === "openai") {
      apiKey = apiKeys.openai || ""
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "OpenAI API key required" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }
      provider = createOpenAI({ apiKey })
    } else if (modelConfig.providerName === "anthropic") {
      apiKey = apiKeys.anthropic || ""
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Anthropic API key required" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }
      provider = createAnthropic({ apiKey })
    } else {
      apiKey = apiKeys.google || ""
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Google API key required" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }
      provider = createGoogleGenerativeAI({ apiKey })
    }

    const prompt = convertToModelMessages(messages)

    const result = streamText({
      model: provider(modelConfig.model),
      prompt,
      abortSignal: req.signal,
      system: "You are a helpful AI assistant. Provide clear, concise, and accurate responses.",
    })

    return result.toUIMessageStreamResponse({
      onFinish: async ({ isAborted }) => {
        if (isAborted) {
          console.log("[Quorum] Chat request aborted")
        }
      },
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error("[Quorum] Chat error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
