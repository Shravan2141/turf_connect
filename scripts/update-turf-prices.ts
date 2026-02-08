import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Usage:
// 1. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env
// 2. Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path
// 3. Run: npx tsx scripts/update-turf-prices.ts

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TARGET_PRICE = 500;

async function main() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    console.error('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID in .env');
    process.exit(1);
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Missing GOOGLE_APPLICATION_CREDENTIALS. Set it to the path of your Firebase service account JSON.');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({ projectId });
  }

  const db = admin.firestore();
  const turfsRef = db.collection('turfs');
  const snapshot = await turfsRef.get();

  if (snapshot.empty) {
    console.log('No turf documents found.');
    return;
  }

  console.log(`Found ${snapshot.size} turf documents. Updating price to ${TARGET_PRICE}...`);
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { price: TARGET_PRICE });
  });

  await batch.commit();
  console.log('Update complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
