import { PLANS } from './plans';

/**
 * True once a trial account's 7-day window has elapsed. Unlimited-credit
 * and admin accounts are always exempt — same bypass every credit-spend
 * route already applies to the balance check, so trial expiry can't lock
 * out an account that's meant to have unrestricted access.
 *
 * Accounts with no recorded trial_started_at are never blocked here; that
 * matches useProfile()'s client-side calculation so the banner and the
 * server enforcement never disagree.
 */
export function isTrialExpired(profile: any): boolean {
  if (!profile) return false;
  if (profile.unlimited_credits === true) return false;
  if (profile.role === 'admin' || profile.is_admin === true) return false;
  if ((profile.plan || 'trial') !== 'trial') return false;

  const startStr = profile.trial_started_at;
  if (!startStr) return false;

  const start = new Date(startStr).getTime();
  if (!Number.isFinite(start)) return false;

  const elapsedDays = (Date.now() - start) / 86400000;
  return elapsedDays >= (PLANS.trial.days ?? 7);
}
