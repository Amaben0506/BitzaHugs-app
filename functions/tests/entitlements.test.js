const assert = require('node:assert/strict');
const {
  buildSubscriptionStatus,
  getAppUserIdFromEvent,
  getEventId,
} = require('../lib/revenuecatEntitlements');

const nowMs = Date.parse('2026-07-05T12:00:00.000Z');
const future = '2026-08-05T12:00:00Z';
const past = '2026-06-05T12:00:00Z';

function subscriber(entitlement = {}, subscription = {}) {
  const productId = entitlement.product_identifier || subscription.product_identifier || 'com.bitzahugs.app.monthly';
  return {
    subscriber: {
      request_date: '2026-07-05T12:00:01Z',
      entitlements: {
        'BitzaHugs Pro': {
          product_identifier: productId,
          expires_date: future,
          period_type: 'normal',
          ...entitlement,
        },
      },
      subscriptions: {
        [productId]: {
          expires_date: entitlement.expires_date || future,
          store: 'app_store',
          ...subscription,
        },
      },
    },
  };
}

function event(type, extra = {}) {
  return {
    event: {
      id: `evt_${type}`,
      type,
      app_user_id: 'firebase_uid_123',
      event_timestamp_ms: nowMs,
      product_id: 'com.bitzahugs.app.monthly',
      ...extra,
    },
  };
}

{
  const status = buildSubscriptionStatus({
    appUserId: 'firebase_uid_123',
    subscriberInfo: subscriber({ period_type: 'trial' }),
    webhookEvent: event('INITIAL_PURCHASE'),
    nowMs,
  });
  assert.equal(status.isPremium, true);
  assert.equal(status.status, 'trial');
  assert.equal(status.entitlementId, 'BitzaHugs Pro');
}

{
  const status = buildSubscriptionStatus({
    appUserId: 'firebase_uid_123',
    subscriberInfo: subscriber({}, { unsubscribe_detected_at: '2026-07-04T12:00:00Z' }),
    webhookEvent: event('CANCELLATION'),
    nowMs,
  });
  assert.equal(status.isPremium, true);
  assert.equal(status.status, 'cancelled_until_expiration');
  assert.equal(status.willRenew, false);
}

{
  const status = buildSubscriptionStatus({
    appUserId: 'firebase_uid_123',
    subscriberInfo: subscriber({ expires_date: past }, { expires_date: past }),
    webhookEvent: event('EXPIRATION'),
    nowMs,
  });
  assert.equal(status.isPremium, false);
  assert.equal(status.status, 'expired');
}

{
  const status = buildSubscriptionStatus({
    appUserId: 'firebase_uid_123',
    subscriberInfo: subscriber({ expires_date: past }, { expires_date: past }),
    webhookEvent: event('REFUND'),
    nowMs,
  });
  assert.equal(status.isPremium, false);
  assert.equal(status.status, 'refunded');
}

{
  const status = buildSubscriptionStatus({
    appUserId: 'firebase_uid_123',
    subscriberInfo: subscriber({ expires_date: past, grace_period_expires_date: future }, { billing_issues_detected_at: '2026-07-05T10:00:00Z' }),
    webhookEvent: event('BILLING_ISSUE'),
    nowMs,
  });
  assert.equal(status.isPremium, true);
  assert.equal(status.status, 'billing_issue');
}

{
  assert.equal(getAppUserIdFromEvent(event('RENEWAL')), 'firebase_uid_123');
  assert.equal(getEventId(event('RENEWAL')), 'evt_RENEWAL');
}

console.log('RevenueCat entitlement mapper tests passed.');
