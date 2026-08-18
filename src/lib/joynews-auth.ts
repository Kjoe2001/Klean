import crypto from 'crypto';

export const JOYNEWS_COOKIE_NAME = 'joynews_session';
const JOYNEWS_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function cookieSecret() {
  return process.env.JOYNEWS_COOKIE_SECRET || 'zelvoo-joynews-dev-only-secret-do-not-use-in-prod';
}

function sign(value: string) {
  return crypto.createHmac('sha256', cookieSecret()).update(value).digest('hex');
}

export function checkJoynewsCredentials(username: string, password: string) {
  const expectedUsername = process.env.JOYNEWS_USERNAME || 'joynews_admin';
  const expectedPassword = process.env.JOYNEWS_PASSWORD || 'JN@Studio2026!';

  const userBuf = Buffer.from(username || '');
  const expectedUserBuf = Buffer.from(expectedUsername);
  const passBuf = Buffer.from(password || '');
  const expectedPassBuf = Buffer.from(expectedPassword);

  const userMatches =
    userBuf.length === expectedUserBuf.length && crypto.timingSafeEqual(userBuf, expectedUserBuf);
  const passMatches =
    passBuf.length === expectedPassBuf.length && crypto.timingSafeEqual(passBuf, expectedPassBuf);

  return userMatches && passMatches;
}

export function createJoynewsSessionToken() {
  const payload = `joynews-authenticated.${Date.now() + JOYNEWS_SESSION_MAX_AGE_SECONDS * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyJoynewsSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [marker, expiresAtRaw, signature] = parts;
  const payload = `${marker}.${expiresAtRaw}`;
  const expected = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return marker === 'joynews-authenticated';
}

export { JOYNEWS_SESSION_MAX_AGE_SECONDS };
