async function getTrustedSubscription(db, uid) {
  const snap = await db.doc(`users/${uid}/subscription/status`).get();
  return snap.exists ? snap.data() : null;
}

async function requirePremium(db, uid, PermissionError = Error) {
  const subscription = await getTrustedSubscription(db, uid);
  const expiresAtMs = subscription?.expirationAtMs || null;
  const graceExpiresAtMs = subscription?.gracePeriodExpirationAtMs || null;
  const stillInWindow =
    expiresAtMs == null ||
    expiresAtMs > Date.now() ||
    (graceExpiresAtMs != null && graceExpiresAtMs > Date.now());

  if (!subscription?.isPremium || !stillInWindow) {
    throw new PermissionError('BitzaHugs Premium is required for this action.');
  }

  return subscription;
}

module.exports = {
  getTrustedSubscription,
  requirePremium,
};
