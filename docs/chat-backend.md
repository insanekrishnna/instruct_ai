# Chat Backend

This backend exposes one production-safe chat endpoint:

```text
POST /api/chat
```

It is authenticated through the existing NextAuth middleware and uses the existing credit/rate-limit system.

## Environment

```env
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.0-flash-lite
LLM_DEBUG=false
CHAT_DEBUG=false
MOCK_GEMINI=false
```

Use `LLM_DEBUG=true` or `CHAT_DEBUG=true` locally to print detailed request, memory, token, and Gemini call logs.

## Request

Streaming is enabled by default.

```json
{
  "requestId": "client-generated-uuid",
  "stream": true,
  "messages": [
    { "role": "user", "content": "Create a short caption about AI." }
  ]
}
```

For non-streaming JSON:

```json
{
  "stream": false,
  "message": "Create a short caption about AI."
}
```

Send `x-request-id` and `x-user-action-id` headers from the client when available. The server also accepts `requestId` in the body.

## Streaming Events

The response uses Server-Sent Events:

```text
event: meta
data: {"requestId":"...","estimatedInputTokens":94,"payloadBytes":376}

event: token
data: {"token":"First streamed text chunk"}

event: usage
data: {"promptTokenCount":100,"candidatesTokenCount":80,"totalTokenCount":180}

event: done
data: {}
```

Errors are sent as:

```text
event: error
data: {"requestId":"...","code":"GEMINI_QUOTA_EXCEEDED","error":"..."}
```

## Safety Model

- Exactly one Gemini stream is created for a unique in-flight request fingerprint.
- Concurrent duplicate sends are rejected with `409 DUPLICATE_IN_FLIGHT`.
- No automatic Gemini retries are performed.
- No websocket reconnects or EventSource auto-retry loops are used server-side.
- Oversized messages and prompts are trimmed before Gemini is called.
- Only recent messages are sent; old messages are compacted into a short local summary.
- Adjacent duplicate messages are removed before prompt construction.

## Debugging

Watch server logs for:

```text
[CHAT_INFO] {"event":"request.start",...}
[CHAT_INFO] {"event":"gemini.call.start","providerCallNumber":1,...}
[CHAT_INFO] {"event":"gemini.call.complete","usage":{...}}
[CHAT_INFO] {"event":"request.complete",...}
```

If one click produces more than one `gemini.call.start`, inspect the `requestId`, `userActionId`, and client submit logic. The server blocks identical concurrent payloads, so repeated calls usually mean the client is sending distinct payloads or IDs.

## Deployment

1. Set `GEMINI_API_KEY` and `GEMINI_MODEL` in the deployment environment.
2. Keep `LLM_DEBUG=false` and `CHAT_DEBUG=false` in production unless investigating an incident.
3. Deploy normally with the existing Next.js build.
4. Confirm logs show one `gemini.call.start` per chat send.
5. Monitor `GEMINI_QUOTA_EXCEEDED`, `DUPLICATE_IN_FLIGHT`, and `RATE_LIMITED` counts.

## Token Optimization

The route keeps token usage low by:

- Limiting output with `maxOutputTokens`.
- Estimating input tokens before the request.
- Trimming oversized messages.
- Sending a sliding window of recent messages.
- Compacting older context into a short summary.
- Removing adjacent duplicate messages.
- Avoiding full database history and hidden metadata in the prompt.
