// Maps raw API error codes (credit-spend routes return these as `error`) to a
// sentence a user can actually act on, instead of showing the slug verbatim.
const ERROR_MESSAGES: Record<string, string> = {
  trial_expired: 'Your free trial has ended. Upgrade to keep using this tool.',
  insufficient_credits: 'Not enough credits for this. Top up or upgrade to continue.',
  unauthorized: 'Please log in again to continue.',
};

export async function readApiResponse(response: Response): Promise<any> {
  const raw = await response.text();
  const text = raw?.trim() || '';

  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const code = data && data.error;
    const message =
      (code && ERROR_MESSAGES[code]) ||
      (data && (data.error || data.message)) ||
      (text ? text.slice(0, 220) : '') ||
      `Request failed (${response.status})`;
    throw new Error(String(message));
  }

  if (data !== null) return data;
  if (!text) return {};
  return { data: text };
}
