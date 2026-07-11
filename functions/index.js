const crypto = require('crypto');
const admin = require('firebase-admin');
const { onCall, HttpsError, onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const {
  buildSubscriptionStatus,
  getAppUserIdFromEvent,
  getEventAtMs,
  getEventId,
  getEventType,
} = require('./lib/revenuecatEntitlements');

admin.initializeApp();

const db = admin.firestore();
const revenueCatWebhookAuthToken = defineSecret('REVENUECAT_WEBHOOK_AUTH_TOKEN');
const revenueCatRestApiKey = defineSecret('REVENUECAT_REST_API_KEY');
const resendApiKey = defineSecret('RESEND_API_KEY');

function hashBody(body) {
  return crypto.createHash('sha256').update(JSON.stringify(body || {})).digest('hex');
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function extractAuthorizationToken(req) {
  const header = req.get('authorization') || req.get('x-revenuecat-authorization') || '';
  if (!header) return '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : header.trim();
}

function toTimestamp(msOrDate) {
  if (!msOrDate) return null;
  const millis = typeof msOrDate === 'number' ? msOrDate : Date.parse(msOrDate);
  if (Number.isNaN(millis)) return null;
  return admin.firestore.Timestamp.fromMillis(millis);
}

async function fetchRevenueCatSubscriber(appUserId) {
  const apiKey = revenueCatRestApiKey.value();
  if (!apiKey) {
    throw new Error('RevenueCat REST API key is not configured.');
  }

  const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`RevenueCat subscriber lookup failed: ${response.status} ${body.slice(0, 120)}`);
  }

  return response.json();
}

async function assertFirebaseUserExists(uid) {
  try {
    await admin.auth().getUser(uid);
    return true;
  } catch (error) {
    if (error?.code === 'auth/user-not-found') return false;
    throw error;
  }
}

function trustedSubscriptionDoc(status, eventId, eventType, source) {
  return {
    isPremium: status.isPremium,
    entitlementId: status.entitlementId,
    status: status.status,
    productId: status.productId,
    periodType: status.periodType,
    expirationDate: toTimestamp(status.expirationAtMs),
    expirationAtMs: status.expirationAtMs,
    gracePeriodExpirationDate: toTimestamp(status.gracePeriodExpirationAtMs),
    gracePeriodExpirationAtMs: status.gracePeriodExpirationAtMs,
    willRenew: status.willRenew,
    store: status.store,
    appUserId: status.appUserId,
    lastEventType: eventType || status.lastEventType,
    lastEventId: eventId || status.lastEventId,
    lastEventAtMs: status.lastEventAtMs,
    rcRequestDateMs: status.rcRequestDateMs,
    source,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

async function writeTrustedEntitlement(uid, status, eventId, eventType, source) {
  const userRef = db.doc(`users/${uid}`);
  const statusRef = db.doc(`users/${uid}/subscription/status`);
  const payload = trustedSubscriptionDoc(status, eventId, eventType, source);

  await db.runTransaction(async (tx) => {
    const current = await tx.get(statusRef);
    const currentData = current.exists ? current.data() : {};
    const incomingRequestMs = payload.rcRequestDateMs || 0;
    const currentRequestMs = currentData.rcRequestDateMs || 0;
    const incomingEventMs = payload.lastEventAtMs || 0;
    const currentEventMs = currentData.lastEventAtMs || 0;

    if (current.exists && incomingRequestMs < currentRequestMs && incomingEventMs < currentEventMs) {
      tx.set(statusRef, {
        lastIgnoredEventId: eventId || null,
        lastIgnoredEventType: eventType || null,
        lastIgnoredAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      return;
    }

    tx.set(statusRef, payload, { merge: true });
    tx.set(userRef, {
      subscription: payload,
      isPremium: payload.isPremium,
      premiumStatusUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      premiumSource: source,
    }, { merge: true });
  });

  return payload;
}

async function syncRevenueCatSubscriberForUid(uid, webhookPayload, source) {
  const subscriberInfo = await fetchRevenueCatSubscriber(uid);
  const status = buildSubscriptionStatus({
    appUserId: uid,
    subscriberInfo,
    webhookEvent: webhookPayload,
  });
  const eventId = getEventId(webhookPayload, null);
  const eventType = getEventType(webhookPayload);
  return writeTrustedEntitlement(uid, status, eventId, eventType, source);
}

exports.revenueCatWebhook = onRequest(
  {
    secrets: [revenueCatWebhookAuthToken, revenueCatRestApiKey],
    timeoutSeconds: 30,
    maxInstances: 10,
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const expectedToken = revenueCatWebhookAuthToken.value();
    const providedToken = extractAuthorizationToken(req);
    if (!expectedToken || !safeEqual(providedToken, expectedToken)) {
      logger.warn('Rejected unauthorized RevenueCat webhook request');
      res.status(401).send('Unauthorized');
      return;
    }

    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).send('Invalid payload');
      return;
    }

    const bodyHash = hashBody(payload);
    const eventId = getEventId(payload, bodyHash);
    const eventType = getEventType(payload);
    const eventAtMs = getEventAtMs(payload);
    const appUserId = getAppUserIdFromEvent(payload);
    const eventRef = db.doc(`revenueCatWebhookEvents/${eventId}`);

    try {
      const eventSnap = await eventRef.get();
      if (eventSnap.exists && eventSnap.data()?.processedAt) {
        res.status(200).json({ ok: true, duplicate: true });
        return;
      }

      await eventRef.set({
        eventId,
        eventType,
        appUserId: appUserId || null,
        eventAtMs: eventAtMs || null,
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        bodyHash,
        status: 'received',
      }, { merge: true });

      if (!appUserId) {
        await eventRef.set({
          status: 'ignored_missing_app_user_id',
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        res.status(400).json({ ok: false, error: 'missing_app_user_id' });
        return;
      }

      const userExists = await assertFirebaseUserExists(appUserId);
      if (!userExists) {
        await eventRef.set({
          status: 'ignored_missing_firebase_user',
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        logger.warn('RevenueCat webhook app user does not match a Firebase user', { eventId, eventType });
        res.status(200).json({ ok: true, ignored: 'missing_firebase_user' });
        return;
      }

      const status = await syncRevenueCatSubscriberForUid(appUserId, payload, 'revenuecat_webhook');

      await eventRef.set({
        status: 'processed',
        isPremium: status.isPremium,
        subscriptionStatus: status.status,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      logger.info('Processed RevenueCat webhook', {
        eventId,
        eventType,
        isPremium: status.isPremium,
        subscriptionStatus: status.status,
      });
      res.status(200).json({ ok: true });
    } catch (error) {
      await eventRef.set({
        status: 'failed',
        errorMessage: String(error?.message || error).slice(0, 400),
        failedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true }).catch(() => {});
      logger.error('RevenueCat webhook processing failed', { eventId, eventType, message: error?.message });
      res.status(500).json({ ok: false, error: 'webhook_processing_failed' });
    }
  },
);

exports.syncRevenueCatEntitlement = onCall(
  {
    secrets: [revenueCatRestApiKey],
    timeoutSeconds: 30,
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in before syncing subscription status.');
    }

    try {
      const status = await syncRevenueCatSubscriberForUid(request.auth.uid, {
        event: {
          id: `manual-sync-${request.auth.uid}-${Date.now()}`,
          type: 'MANUAL_SYNC',
          app_user_id: request.auth.uid,
          event_timestamp_ms: Date.now(),
        },
      }, 'manual_sync');

      return {
        isPremium: status.isPremium,
        status: status.status,
        entitlementId: status.entitlementId,
        expirationAtMs: status.expirationAtMs,
        willRenew: status.willRenew,
      };
    } catch (error) {
      logger.error('Manual RevenueCat entitlement sync failed', { uid: request.auth.uid, message: error?.message });
      throw new HttpsError('internal', 'Could not sync subscription status.');
    }
  },
);

exports.deleteAccountAndData = onCall(
  { timeoutSeconds: 120 },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in before deleting your account.');
    }
    const uid = request.auth.uid;

    try {
      const authoredPostsSnap = await db.collection('communityPosts')
        .where('authorId', '==', uid)
        .get();
      await Promise.all(authoredPostsSnap.docs.map((docSnap) => db.recursiveDelete(docSnap.ref)));

      const authoredCommentsSnap = await db.collectionGroup('comments')
        .where('authorId', '==', uid)
        .get();
      await Promise.all(authoredCommentsSnap.docs.map((docSnap) => db.recursiveDelete(docSnap.ref)));

      const reactionSnap = await db.collectionGroup('reactions')
        .where('uid', '==', uid)
        .get();
      await Promise.all(reactionSnap.docs.map((docSnap) => db.recursiveDelete(docSnap.ref)));

      const userRef = db.doc(`users/${uid}`);
      await db.recursiveDelete(userRef);

      await admin.auth().deleteUser(uid);

      logger.info('Deleted account and data', { uid });
      return { success: true };
    } catch (error) {
      logger.error('Account deletion failed', { uid, message: error?.message });
      throw new HttpsError('internal', 'Could not delete account. Please try again or contact support.');
    }
  },
);

exports.notifyOnCommunityReport = onDocumentCreated(
  {
    document: 'communityReports/{reportId}',
    secrets: [resendApiKey],
  },
  async (event) => {
    try {
      const report = event.data?.data() || {};
      const {
        targetType,
        postId,
        targetId,
        reporterId,
        reason,
        detail,
        createdAt,
      } = report;

      const createdAtText =
        createdAt?.toDate ? createdAt.toDate().toISOString() : String(createdAt || 'unknown');
      const reasonText = reason || 'unspecified';

      const text = [
        'A new community report was submitted in BitzaHugs.',
        '',
        `Report ID: ${event.params.reportId}`,
        `Target type: ${targetType || 'unknown'}`,
        `Post ID: ${postId || 'unknown'}`,
        `Target ID: ${targetId || 'unknown'}`,
        `Reporter ID: ${reporterId || 'unknown'}`,
        `Reason: ${reasonText}`,
        `Detail: ${detail || 'none provided'}`,
        `Created at: ${createdAtText}`,
        '',
        'Please review this routine community report in the Moderation screen.',
      ].join('\n');

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey.value()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'BitzaHugs <hello@bitzahugs.com>',
          to: ['hello@bitzahugs.com'],
          subject: `New community report: ${reasonText}`,
          text,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        logger.error('Community report notification email failed', {
          reportId: event.params.reportId,
          status: response.status,
          body: body.slice(0, 300),
        });
        return;
      }

      logger.info('Community report notification email sent', {
        reportId: event.params.reportId,
        targetType,
        postId,
        targetId,
        reason: reasonText,
      });
    } catch (error) {
      logger.error('Community report notification failed', {
        reportId: event.params.reportId,
        message: error?.message,
      });
    }
  },
);

exports.notifyOnCrisisFlag = onDocumentCreated(
  {
    document: 'crisisFlags/{flagId}',
    secrets: [resendApiKey],
  },
  async (event) => {
    try {
      const flag = event.data?.data() || {};
      const {
        targetType,
        postId,
        targetId,
        authorId,
        createdAt,
      } = flag;

      const createdAtText =
        createdAt?.toDate ? createdAt.toDate().toISOString() : String(createdAt || 'unknown');

      const text = [
        'Crisis language was flagged in the BitzaHugs community.',
        '',
        `Flag ID: ${event.params.flagId}`,
        `Target type: ${targetType || 'unknown'}`,
        `Post ID: ${postId || 'unknown'}`,
        `Target ID: ${targetId || 'unknown'}`,
        `Author ID: ${authorId || 'unknown'}`,
        `Created at: ${createdAtText}`,
        '',
        'Please check on this post/comment in the Moderation screen as a priority item, not a routine queue item.',
      ].join('\n');

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey.value()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'BitzaHugs <hello@bitzahugs.com>',
          to: ['hello@bitzahugs.com'],
          subject: '⚠️ Crisis language flagged in community post',
          text,
        }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        logger.error('Crisis flag notification email failed', {
          flagId: event.params.flagId,
          status: response.status,
          body: body.slice(0, 300),
        });
        return;
      }

      logger.info('Crisis flag notification email sent', {
        flagId: event.params.flagId,
        targetType,
        postId,
        targetId,
      });
    } catch (error) {
      logger.error('Crisis flag notification failed', {
        flagId: event.params.flagId,
        message: error?.message,
      });
    }
  },
);

// ── Share code redemption (Stage B) ──────────────────────────────────────────
// Firestore rules deliberately grant no public read on shareCodes or on
// users/{uid}/... (owner-only). This is the sole path an anonymous teacher/
// therapist has to redeem a code from the web team portal — it bypasses
// rules by design via the Admin SDK.

const SHARE_CODE_ALLOWED_ORIGINS = new Set([
  'https://bitzahugs.com',
  'https://www.bitzahugs.com',
]);

function applyShareCodeCors(req, res) {
  const origin = req.get('origin');
  if (origin && SHARE_CODE_ALLOWED_ORIGINS.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Vary', 'Origin');
}

function getClientIp(req) {
  const forwarded = req.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.ip || 'unknown';
}

// Best-effort and per-instance only: this counter lives in memory, so it
// resets on cold start and is not shared across concurrent instances. It
// raises the cost of casual guessing; it is not a hard rate-limit guarantee.
// If this collection ever needs a real guarantee, put App Check / Cloud
// Armor in front of it instead.
const SHARE_CODE_FAILURE_WINDOW_MS = 10 * 60 * 1000;
const SHARE_CODE_FAILURE_LIMIT = 10;
const shareCodeFailuresByIp = new Map();

function isShareCodeRateLimited(ip) {
  const now = Date.now();
  const attempts = (shareCodeFailuresByIp.get(ip) || []).filter(
    (t) => now - t < SHARE_CODE_FAILURE_WINDOW_MS,
  );
  shareCodeFailuresByIp.set(ip, attempts);
  return attempts.length >= SHARE_CODE_FAILURE_LIMIT;
}

function recordShareCodeFailure(ip) {
  const attempts = shareCodeFailuresByIp.get(ip) || [];
  attempts.push(Date.now());
  shareCodeFailuresByIp.set(ip, attempts);
}

const SHARE_CODE_INVALID_RESPONSE = { error: 'Invalid or expired code' };

exports.redeemShareCode = onRequest(
  { timeoutSeconds: 15, maxInstances: 20 },
  async (req, res) => {
    applyShareCodeCors(req, res);

    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const ip = getClientIp(req);
    if (isShareCodeRateLimited(ip)) {
      logger.warn('redeemShareCode rate limited', { ip });
      res.status(429).json({ error: 'Too many attempts. Please try again later.' });
      return;
    }

    const code = req.body?.code;
    if (typeof code !== 'string' || !/^\d{6}$/.test(code)) {
      recordShareCodeFailure(ip);
      logger.warn('redeemShareCode rejected malformed code', { ip });
      res.status(400).json({ error: 'Code must be exactly 6 digits.' });
      return;
    }

    try {
      const querySnap = await db.collection('shareCodes').where('code', '==', code).limit(1).get();
      if (querySnap.empty) {
        recordShareCodeFailure(ip);
        logger.warn('redeemShareCode: no matching code', { ip });
        res.status(404).json(SHARE_CODE_INVALID_RESPONSE);
        return;
      }

      const shareCodeDoc = querySnap.docs[0];
      const shareCode = shareCodeDoc.data();
      const expiresAtMs = Date.parse(shareCode?.expires);
      const isValid = shareCode?.active === true
        && !Number.isNaN(expiresAtMs)
        && expiresAtMs > Date.now();

      if (!isValid) {
        recordShareCodeFailure(ip);
        logger.warn('redeemShareCode: code inactive or expired', { ip });
        res.status(404).json(SHARE_CODE_INVALID_RESPONSE);
        return;
      }

      const uid = shareCodeDoc.id;
      const [childProfileSnap, routinesSnap, moodHistorySnap, calmToolUsesSnap] = await Promise.all([
        db.doc(`users/${uid}/childProfile/data`).get(),
        db.doc(`users/${uid}/routines/data`).get(),
        db.doc(`users/${uid}/moodHistory/data`).get(),
        db.doc(`users/${uid}/calmToolUses/data`).get(),
      ]);

      logger.info('redeemShareCode: code redeemed', { ip });

      // Every doc here is written as { data: <payload>, updatedAt, migratedAt }
      // by the app's syncService.js (and matching web writes) — unwrap the
      // outer envelope so the response is the payload itself, matching what
      // team-view.html rendered when it read these documents directly.
      res.status(200).json({
        ok: true,
        data: {
          childProfile: childProfileSnap.exists ? (childProfileSnap.data()?.data ?? null) : null,
          routines: routinesSnap.exists ? (routinesSnap.data()?.data ?? null) : null,
          moodHistory: moodHistorySnap.exists ? (moodHistorySnap.data()?.data ?? null) : null,
          calmToolUses: calmToolUsesSnap.exists ? (calmToolUsesSnap.data()?.data ?? null) : null,
        },
      });
    } catch (error) {
      logger.error('redeemShareCode failed', { ip, message: error?.message });
      res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  },
);
