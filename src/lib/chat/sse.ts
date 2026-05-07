const encoder = new TextEncoder();

export type SseWriter = {
  write: (event: string, data: unknown) => void;
  close: () => void;
  error: (data: unknown) => void;
};

export function createSseStream(handler: (writer: SseWriter) => Promise<void>) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const writer: SseWriter = {
        write(event, data) {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        },
        error(data) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify(data)}\n\n`));
        },
        close() {
          controller.enqueue(encoder.encode('event: done\ndata: {}\n\n'));
          controller.close();
        },
      };

      try {
        await handler(writer);
      } catch (error) {
        writer.error({
          error: error instanceof Error ? error.message : 'Stream failed',
        });
        controller.close();
      }
    },
  });
}

export function sseResponse(stream: ReadableStream<Uint8Array>) {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
