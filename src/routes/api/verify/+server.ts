import type { RequestHandler } from '@sveltejs/kit';
import admin from 'firebase-admin';

// Initialize admin once
if (!admin.apps.length) {
  const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
  admin.initializeApp({
    credential: admin.credential.cert(svc),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

export const POST: RequestHandler = async ({ request }) => {
  const { idToken } = await request.json();
  if (!idToken) return new Response('Missing token', { status: 400 });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email || '';
    // allowed emails from env (comma-separated) or fetch from Firestore
    const allowed = (process.env.ALLOWED_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!allowed.includes(email)) {
      return new Response('Forbidden', { status: 403 });
    }
    // success — set session cookie or return ok
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response('Invalid token', { status: 401 });
  }
};