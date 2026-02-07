# Firebase Auth & Firestore Setup

## Roles

- **Normal users**: Must log in with Google to book turfs. Can create bookings and delete only their own.
- **Admins**: Users whose email is in `NEXT_PUBLIC_ADMIN_EMAIL` and in the Firestore `config/admins` document. Can access the admin panel, add turfs, and manage bookings.

## Setup Steps

### 1. Environment variables

In `.env`:

```
NEXT_PUBLIC_ADMIN_EMAIL="admin@example.com"
# For multiple admins:
NEXT_PUBLIC_ADMIN_EMAIL="admin1@example.com,admin2@example.com"
```

### 2. Firestore config document (REQUIRED for admin features)

**Important:** Without this, Add Turf, Seed Turfs, and delete bookings will fail with "Missing or insufficient permissions."

**Option A – Use the seed script (recommended):**

1. Download a service account key from Firebase Console → Project Settings → Service accounts → Generate new private key.
2. Set `GOOGLE_APPLICATION_CREDENTIALS` to the path of the JSON file, e.g.:
   ```bash
   set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\your-service-account.json
   ```
3. Run: `npm run seed`

This creates `config/admins` using the emails from `NEXT_PUBLIC_ADMIN_EMAIL` in your `.env` and seeds the default turfs (if the turfs collection is empty).

**Option B – Manual setup in Firebase Console:**

1. Go to Firebase Console → Firestore Database → Data
2. Click "Start collection" (or add to existing)
3. Collection ID: `config`
4. Document ID: `admins`
5. Add field: `emails` (type: array), value: `["admin@example.com"]` (use your own admin email)

```json
{
  "emails": ["admin@example.com"]
}
```

For multiple admins:

```json
{
  "emails": ["admin1@example.com", "admin2@example.com"]
}
```

These emails must match the ones in `NEXT_PUBLIC_ADMIN_EMAIL`. The `config` collection is locked by Firestore rules (no client writes), so create this document via Firebase Console or Admin SDK.

### 3. Deploy Firestore rules

Copy the contents of `firestore.rules` into Firebase Console → Firestore Database → Rules, then publish.

Or with Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

(Requires `firebase.json` and `firestore.rules` in the project.)

## Permissions Summary

| Action      | Normal user | Admin |
|-------------|-------------|-------|
| Read bookings | ✓ | ✓ |
| Create booking | ✓ (own) | ✓ |
| Delete own booking | ✓ | ✓ |
| Delete any booking | ✗ | ✓ |
| Access /admin | ✗ | ✓ |
