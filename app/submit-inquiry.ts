export type SubmitResult = { ok: true } | { ok: false; error: string; field?: string };

/** Send a website request to /api/inquiries. Never throws; always resolves to a result the form can show. */
export async function submitInquiry(data: Record<string, unknown>): Promise<SubmitResult> {
  try {
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) return { ok: true };
    const body = (await response.json().catch(() => ({}))) as { error?: string; field?: string };
    return {
      ok: false,
      error: body.error || "Something went wrong on our end. Please try again in a minute.",
      field: body.field,
    };
  } catch {
    return {
      ok: false,
      error: "We couldn't reach the server. Check your connection and try again.",
    };
  }
}
