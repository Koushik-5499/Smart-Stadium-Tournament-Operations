/**
 * Admin script to set the 'staff' custom claim on Firebase Auth users.
 *
 * FIX #1: The Firestore security rules reference request.auth.token.role == 'staff',
 * so this script is needed to actually assign that custom claim to specific users.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json \
 *   node scripts/setStaffClaim.mjs <user-email>
 *
 * Or via npm:
 *   npm run set-staff-claim -- <user-email>
 *
 * Prerequisites:
 *   1. Download a service account key from Firebase Console:
 *      Project Settings → Service Accounts → Generate New Private Key
 *   2. Set GOOGLE_APPLICATION_CREDENTIALS env var to the key file path
 *
 * @module scripts/setStaffClaim
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/setStaffClaim.mjs <user-email>');
  console.error('Example: node scripts/setStaffClaim.mjs staff@example.com');
  process.exit(1);
}

// Initialize Firebase Admin (uses GOOGLE_APPLICATION_CREDENTIALS env var)
if (getApps().length === 0) {
  // If GOOGLE_APPLICATION_CREDENTIALS is set, cert() picks it up automatically.
  // Otherwise, fall back to application default credentials.
  try {
    initializeApp({
      projectId: 'smart-stadium-wc2026',
    });
  } catch {
    console.error('Failed to initialize Firebase Admin.');
    console.error('Make sure GOOGLE_APPLICATION_CREDENTIALS is set to your service account key path.');
    process.exit(1);
  }
}

async function setStaffClaim(userEmail) {
  const auth = getAuth();

  try {
    // Look up the user by email
    const user = await auth.getUserByEmail(userEmail);
    console.log(`Found user: ${user.uid} (${user.email})`);

    // Set the custom claim
    await auth.setCustomUserClaims(user.uid, { role: 'staff' });
    console.log(`✅ Successfully set 'role: staff' custom claim for ${userEmail}`);
    console.log('');
    console.log('The user must sign out and sign back in for the claim to take effect.');
    console.log('After re-signing in, they will have access to the Control Room and staff features.');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ No user found with email: ${userEmail}`);
      console.error('Make sure the user has signed up first.');
    } else {
      console.error('❌ Error setting custom claim:', error.message);
    }
    process.exit(1);
  }
}

setStaffClaim(email);
