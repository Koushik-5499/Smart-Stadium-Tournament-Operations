const admin = require('firebase-admin');

try {
  admin.initializeApp({
    projectId: 'smart-stadium-wc2026'
  });
  console.log('App initialized.');
  admin.auth().verifyIdToken('fake_token').catch(e => {
    console.log('Verify failed (expected):', e.message);
  });
} catch (e) {
  console.error('Init failed:', e.message);
}
