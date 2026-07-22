-- profiles.credits column default was 0, not the 50 credits the trial actually
-- promises (PLANS.trial.credits in src/lib/plans.ts drives the "50 credits to
-- explore" marketing copy shown on pricing/checkout). The on_auth_user_created
-- trigger's insert doesn't set credits explicitly, so every new signup fell
-- through to this default. No existing users were affected (confirmed zero
-- trial profiles with credits <= 0) since the trigger itself was missing until
-- just now — but every signup from this point forward would have hit it.

alter table profiles alter column credits set default 50;
