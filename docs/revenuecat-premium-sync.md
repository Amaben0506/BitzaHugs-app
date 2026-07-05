# RevenueCat Premium Sync

## Audit Summary

- No existing Firebase Functions project was present before this change.
- Firestore rules existed at `firestore.rules`.
- The Firebase project ID used by the client is `bitzahugs`.
- RevenueCat was already configured in `src/lib/revenuecat.js` with the `BitzaHugs Pro` entitlement.
- RevenueCat was not previously configured with a Firebase Auth UID as `appUserID`; the client now configures/logs in RevenueCat with the current Firebase UID.
- No portal or callable/HTTP Premium backend endpoints were present in this repo.
- No analytics provider was present or added.
- Existing client Premium fields used `bitzaIsPremium` only as local UI cache. Trusted server state now lives in Firestore.

## Trusted Firestore Schema

The backend writes:

```text
users/{uid}/subscription/status
```

Fields include:

- `isPremium`
- `entitlementId`
- `status`
- `productId`
- `periodType`
- `expirationDate`
- `expirationAtMs`
- `gracePeriodExpirationDate`
- `gracePeriodExpirationAtMs`
- `willRenew`
- `store`
- `appUserId`
- `lastEventType`
- `lastEventId`
- `lastEventAtMs`
- `rcRequestDateMs`
- `source`
- `updatedAt`

The backend also mirrors a summary to `users/{uid}.subscription` and `users/{uid}.isPremium` for admin/portal convenience. Clients cannot write these fields.

Webhook metadata is stored at:

```text
revenueCatWebhookEvents/{eventId}
```

This collection is not client-readable or client-writable.

## Functions

- `revenueCatWebhook`: HTTPS endpoint for RevenueCat webhooks.
- `syncRevenueCatEntitlement`: callable function for authenticated user repair/manual sync after sign-in, restore, or purchase.
- `functions/lib/premiumAccess.js`: reusable backend helper with `requirePremium(db, uid)` for future AI/PDF/export/share-code endpoints.

## Required Secrets

Set these with Firebase Functions secrets:

```sh
firebase functions:secrets:set REVENUECAT_WEBHOOK_AUTH_TOKEN
firebase functions:secrets:set REVENUECAT_REST_API_KEY
```

`REVENUECAT_WEBHOOK_AUTH_TOKEN` is the strong shared authorization value you configure in RevenueCat webhooks.

`REVENUECAT_REST_API_KEY` must be a server-side RevenueCat REST API key. Do not put this value in the app.

## Deploy

Install function dependencies once:

```sh
cd functions
npm install
cd ..
```

Deploy rules and functions:

```sh
firebase deploy --only firestore:rules,functions
```

Deploy only the webhook/callable later:

```sh
firebase deploy --only functions:revenueCatWebhook,functions:syncRevenueCatEntitlement
```

## RevenueCat Dashboard Setup

1. Deploy functions.
2. Copy the HTTPS URL for `revenueCatWebhook` from Firebase output.
3. In RevenueCat, add a webhook URL for the appropriate project/environment.
4. Set the webhook authorization header to the same value stored in `REVENUECAT_WEBHOOK_AUTH_TOKEN`.
5. Enable subscription lifecycle events for purchases, renewals, cancellations, billing issues, expirations, product changes, refunds, transfers, and temporary grants.
6. Send a RevenueCat test webhook.
7. Confirm `revenueCatWebhookEvents/{eventId}` is created.
8. Confirm `users/{firebaseUid}/subscription/status` updates.

## Testing

Local pure mapper tests:

```sh
node functions/tests/entitlements.test.js
```

Syntax checks:

```sh
node --check functions/index.js
node --check functions/lib/revenuecatEntitlements.js
node --check functions/lib/premiumAccess.js
```

App type check:

```sh
npx tsc --noEmit
```

Manual checklist:

- Unauthorized webhook returns `401`.
- Non-POST webhook returns `405`.
- Valid initial purchase sets `isPremium: true`.
- Trial start sets `status: trial`.
- Renewal keeps `isPremium: true`.
- Cancellation before expiration keeps `isPremium: true` and `willRenew: false`.
- Expiration sets `isPremium: false`.
- Refund sets `isPremium: false`.
- Billing issue/grace period preserves access only while RevenueCat entitlement remains active.
- Duplicate event returns success without duplicate writes.
- Missing Firebase user is logged and ignored without creating Premium state.
- Callable sync requires auth and uses only `request.auth.uid`.
- Free server endpoint calls using `requirePremium` reject with permission error.
- Premium server endpoint calls using `requirePremium` proceed.

## Identity Notes

RevenueCat App User ID must equal Firebase Auth UID. The app now calls RevenueCat with `appUserID: user.uid` and `Purchases.logIn(user.uid)` when the Firebase user changes.

Existing users who purchased under anonymous RevenueCat IDs may require RevenueCat alias/transfer behavior during first `logIn`. Verify sandbox restores before production rollout.

## Rollback

1. Disable the RevenueCat webhook in the RevenueCat dashboard.
2. Redeploy the previous Firebase Functions version or remove the webhook function.
3. Keep Firestore rules blocking client Premium writes.
4. Use RevenueCat dashboard/customer support tooling to manually repair affected entitlements if needed.
