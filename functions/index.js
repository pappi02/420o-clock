const {onCall} = require("firebase-functions/v2/https");
const {logger} = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// createUser - Creates pending user invite for WhatsApp signup
exports.createUser = onCall({region: "us-central1"}, async (request) => {
  logger.info("createUser called", {data: request.data});

  const caller = request.auth;
  if (!caller) {
    throw new Error("Authentication required");
  }

  const adminDoc = await admin.firestore().collection("admins").doc(caller.uid).get();
  if (!adminDoc.exists) {
    throw new Error("Admin access required");
  }

  const {whatsapp} = request.data;
  if (!whatsapp || typeof whatsapp !== "string") {
    throw new Error("Valid WhatsApp number required");
  }

  const normalizedWhatsapp = whatsapp.replace(/[^+0-9]/g, "");

  const existing = await admin.firestore().collection("pendingUsers").doc(normalizedWhatsapp).get();
  if (existing.exists) {
    throw new Error("Invitation already sent");
  }

  await admin.firestore().collection("pendingUsers").doc(normalizedWhatsapp).set({
    whatsapp: normalizedWhatsapp,
    status: "pending",
    invitedBy: caller.uid,
    invitedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ),
  });

  logger.info("Pending invite created", {whatsapp: normalizedWhatsapp});

  return {success: true, message: "Invitation created"};
});

