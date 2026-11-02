import { NextResponse } from "next/server";

/**
 * Mock sync endpoint used by the Background Sync card (and, in a full Serwist
 * setup, by the service worker's `sync` event handler). It deliberately does not
 * persist anything: it logs the payload and acknowledges it so the client can
 * clear its IndexedDB queue.
 */

type SyncMessage = {
  id?: number;
  text?: string;
  createdAt?: number;
};

export async function POST(request: Request) {
  let payload: { messages?: SyncMessage[] } | null = null;

  try {
    payload = (await request.json()) as { messages?: SyncMessage[] };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const messages = Array.isArray(payload?.messages)
    ? payload.messages.filter((message) => typeof message?.text === "string")
    : [];

  console.log(`[mock-sync] received ${messages.length} message(s)`, messages);

  return NextResponse.json({
    ok: true,
    received: messages.length,
    processedAt: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/sync",
    method: "POST",
    description: "Mock receiver for queued Background Sync messages.",
  });
}
