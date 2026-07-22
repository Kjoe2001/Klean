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
    const message =
      (data && (data.error || data.message)) ||
      (text ? text.slice(0, 220) : '') ||
      `Request failed (${response.status})`;
    throw new Error(String(message));
  }

  if (data !== null) return data;
  if (!text) return {};
  return { data: text };
}
