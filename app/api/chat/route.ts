export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]?.content || ''

    const responseText = "I'm a demo AI assistant. To use real AI models, you'll need to configure API keys for OpenAI, Anthropic, or Google AI."

    const encoder = new TextEncoder()
    const customReadable = new ReadableStream({
      start(controller) {
        const messageId = Math.random().toString(36).substring(7)
        controller.enqueue(encoder.encode(`2:[{"type":"message_part","delta":{"type":"text","text":"${responseText}"},"part":{"type":"text","text":"${responseText}"}}]\n`))
        controller.enqueue(encoder.encode(`8:[{"type":"finish","reason":"stop","usage":{"promptTokens":10,"completionTokens":20}}]\n`))
        controller.close()
      }
    })

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
