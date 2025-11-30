export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const response = "I'm a demo AI assistant. To use real AI models, you'll need to configure API keys for OpenAI, Anthropic, or Google AI."
        controller.enqueue(encoder.encode(`0:${JSON.stringify({ type: "text", text: response })}\n`))
        controller.close()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    return Response.json({ error: "Failed to process chat request" }, { status: 500 })
  }
}
