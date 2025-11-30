export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return Response.json({ error: "No prompt provided" }, { status: 400 })
    }

    return Response.json({
      error: "Image generation requires API key configuration",
      message: "To use image generation, configure Google AI or other image generation API keys"
    }, { status: 501 })
  } catch (error) {
    console.error("Error generating image:", error)
    return Response.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
