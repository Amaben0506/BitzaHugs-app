const PREMIUM_ENTITLEMENT_ID = 'BitzaHugs Pro';

const ACTIVE_EVENT_TYPES = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
  'TEMPORARY_ENTITLEMENT_GRANT',
  'SUBSCRIPTION_EXTENDED',
  'TRANSFER',
]);

const INACTIVE_EVENT_TYPES = new Set([
  'EXPIRATION',
  'REFUND',
  'BILLING_ISSUE',
]);

function toMillis(value) {
  if (!value) return null;
  if (typeof value === 'number') return value;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function isFuture(value, nowMs = Date.now(), nullIsFuture = true) {
  const millis = toMillis(value);
  if (millis == null) return nullIsFuture;
  return millis > nowMs;
}

function normalizePeriodType(value) {
  if (!value) return null;
  return String(value).toLowerCase();
}

function getRevenueCatEvent(payload) {
  return payload && typeof payload === 'object' ? payload.event || payload : null;
}

function getEventId(payload, hashFallback) {
  const event = getRevenueCatEvent(payload);
  return event?.id || event?.event_id || payload?.id || hashFallback;
}

function getAppUserIdFromEvent(payload) {
  const event = getRevenueCatEvent(payload);
  return event?.app_user_id || event?.original_app_user_id || event?.subscriber_id || null;
}

function getEventType(payload) {
  const event = getRevenueCatEvent(payload);
  return event?.type || event?.event_type || 'UNKNOWN';
}

function getEventAtMs(payload) {
  const event = getRevenueCatEvent(payload);
  return toMillis(event?.event_timestamp_ms || event?.purchased_at_ms || event?.expiration_at_ms || payload?.event_timestamp_ms);
}

function getMatchingSubscription(subscriber, productId) {
  if (!subscriber?.subscriptions || !productId) return null;
  return subscriber.subscriptions[productId] || null;
}

function buildSubscriptionStatus({
  appUserId,
  subscriberInfo,
  webhookEvent,
  nowMs = Date.now(),
}) {
  const subscriber = subscriberInfo?.subscriber || subscriberInfo || {};
  const entitlements = subscriber.entitlements || {};
  const entitlement = entitlements[PREMIUM_ENTITLEMENT_ID] || null;
  const eventType = getEventType(webhookEvent);

  const productId =
    entitlement?.product_identifier ||
    getRevenueCatEvent(webhookEvent)?.product_id ||
    null;
  const subscription = getMatchingSubscription(subscriber, productId);
  const expirationDate =
    entitlement?.expires_date ||
    subscription?.expires_date ||
    getRevenueCatEvent(webhookEvent)?.expiration_at_ms ||
    null;
  const gracePeriodExpirationDate =
    entitlement?.grace_period_expires_date ||
    subscription?.grace_period_expires_date ||
    null;

  const entitlementInPaidWindow = !!entitlement && isFuture(expirationDate, nowMs);
  const entitlementInGracePeriod = !!entitlement && !entitlementInPaidWindow && isFuture(gracePeriodExpirationDate, nowMs, false);
  const hasActiveEntitlement = entitlementInPaidWindow || entitlementInGracePeriod;
  const refunded = eventType === 'REFUND';
  const expired = eventType === 'EXPIRATION' && !hasActiveEntitlement;
  const billingIssue = eventType === 'BILLING_ISSUE' || !!subscription?.billing_issues_detected_at;
  const cancelled = !!subscription?.unsubscribe_detected_at || eventType === 'CANCELLATION';
  const periodType = normalizePeriodType(entitlement?.period_type || subscription?.period_type || getRevenueCatEvent(webhookEvent)?.period_type);

  let status = hasActiveEntitlement ? 'active' : 'inactive';
  if (hasActiveEntitlement && periodType === 'trial') status = 'trial';
  if (hasActiveEntitlement && entitlementInGracePeriod) status = 'grace_period';
  if (hasActiveEntitlement && billingIssue) status = 'billing_issue';
  if (hasActiveEntitlement && cancelled) status = 'cancelled_until_expiration';
  if (!hasActiveEntitlement && expired) status = 'expired';
  if (!hasActiveEntitlement && refunded) status = 'refunded';
  if (!hasActiveEntitlement && ACTIVE_EVENT_TYPES.has(eventType) && !entitlement) status = 'pending_verification';
  if (!hasActiveEntitlement && INACTIVE_EVENT_TYPES.has(eventType) && status === 'inactive') status = eventType.toLowerCase();

  return {
    appUserId,
    isPremium: hasActiveEntitlement,
    entitlementId: PREMIUM_ENTITLEMENT_ID,
    status,
    productId,
    periodType,
    expirationDate,
    expirationAtMs: toMillis(expirationDate),
    gracePeriodExpirationDate,
    gracePeriodExpirationAtMs: toMillis(gracePeriodExpirationDate),
    willRenew: hasActiveEntitlement ? !cancelled : false,
    store: entitlement?.store || subscription?.store || getRevenueCatEvent(webhookEvent)?.store || null,
    lastEventType: eventType,
    lastEventId: getEventId(webhookEvent, null),
    lastEventAtMs: getEventAtMs(webhookEvent),
    rcRequestDateMs: toMillis(subscriber.request_date || subscriberInfo?.request_date),
    source: 'revenuecat_webhook',
  };
}

module.exports = {
  PREMIUM_ENTITLEMENT_ID,
  buildSubscriptionStatus,
  getAppUserIdFromEvent,
  getEventAtMs,
  getEventId,
  getEventType,
  getRevenueCatEvent,
  toMillis,
};
