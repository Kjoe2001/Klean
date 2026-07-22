-- /api/flutterwave/verify and /api/flutterwave/webhook both upsert subscriptions
-- with onConflict: 'user_id', but schema.sql never gave subscriptions a unique
-- constraint on user_id (a pre-existing gap in schema.sql itself). Confirmed by
-- testing the real upsert call, which failed with "no unique or exclusion
-- constraint matching the ON CONFLICT specification". Table was just created and
-- was empty at the time, so this was safe to add directly.

alter table subscriptions add constraint subscriptions_user_id_key unique (user_id);
