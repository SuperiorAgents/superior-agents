import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionId = (await params).id;
  const externalSSEUrl = `${process.env.NEXT_PUBLIC_AGENT_API_URL}/sessions/${sessionId}/logs`; // External SSE API

  const response = await fetch(externalSSEUrl, {
    headers: { Accept: "text/event-stream" },
  });

  if (!response.body) {
    return new Response("Failed to connect to SSE", { status: 500 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          controller.enqueue(encoder.encode(decoder.decode(value)));
        }

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
