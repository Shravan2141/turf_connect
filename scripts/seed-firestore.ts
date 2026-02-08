/**
 * Seed script for Firestore: creates config/admins and default turfs.
 * Run with: npx tsx scripts/seed-firestore.ts
 *
 * Requires:
 * - GOOGLE_APPLICATION_CREDENTIALS pointing to a service account JSON, OR
 * - Firebase project credentials in the environment
 *
 * Loads .env from project root for NEXT_PUBLIC_FIREBASE_PROJECT_ID.
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Admin emails from env (comma-separated). Must match NEXT_PUBLIC_ADMIN_EMAIL in .env.
const raw = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim();
const ADMIN_EMAILS = raw ? raw.split(',').map((e) => e.trim()).filter(Boolean) : [];

const DEFAULT_TURFS = [
  {
    name: 'Pavallion Sports Arena T1',
    location: 'Mira Bhayandar',
    price: 500,
    amenities: ['Parking', 'Floodlights', 'Washroom', 'Equipments'],
    imageId: 'turf-1',
  },
  {
    name: 'Pavallion Sports Arena T2',
    location: 'Mira Bhayandar',
    price: 500,
    amenities: ['Parking', 'Floodlights', 'Washroom', 'Equipments'],
    imageId: 'turf-2',
  },
  {
    name: 'Pavallion Sports Arena T3',
    location: 'Mira Bhayandar',
    price: 500,
    amenities: ['Parking', 'Floodlights', 'Washroom', 'Equipments'],
    imageId: 'turf-3',
  },
];

async function main() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env');
    process.exit(1);
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      'Missing GOOGLE_APPLICATION_CREDENTIALS. Set it to the path of your Firebase service account JSON.\n' +
        'Download from: Firebase Console → Project Settings → Service accounts → Generate new private key.'
    );
    process.exit(1);
  }

  // Initialize Firebase Admin only if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
  }

  if (ADMIN_EMAILS.length === 0) {
    console.error(
      'Missing NEXT_PUBLIC_ADMIN_EMAIL in .env. Set it to your admin email (comma-separated for multiple), e.g.:\n' +
        '  NEXT_PUBLIC_ADMIN_EMAIL="admin@example.com"'
    );
    process.exit(1);
  }

  const db = admin.firestore();

  // 1. Create or update config/admins
  const adminsRef = db.doc('config/admins');
  await adminsRef.set({ emails: ADMIN_EMAILS }, { merge: true });
  console.log('✓ config/admins created/updated with:', ADMIN_EMAILS.join(', '));

  // 2. Seed default turfs (only if collection is empty)
  const turfsSnapshot = await db.collection('turfs').limit(1).get();
  if (!turfsSnapshot.empty) {
    console.log('⚠ Turfs already exist – skipping turf seed. Delete turfs in Firebase Console if you want to re-seed.');
  } else {
    const batch = db.batch();
    for (const turf of DEFAULT_TURFS) {
      const ref = db.collection('turfs').doc();
      batch.set(ref, turf);
    }
    await batch.commit();
    console.log('✓ Seeded', DEFAULT_TURFS.length, 'default turfs');
  }

  console.log('\nDone. You can now log in as', ADMIN_EMAILS[0], 'and use the admin panel.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
