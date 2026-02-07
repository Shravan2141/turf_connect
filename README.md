# Pavallion Sports Arena

Welcome to the Pavallion Sports Arena booking application! This is a Next.js web app that allows users to browse and book sports turfs. It features a user-friendly interface for customers and a dedicated admin panel for managing bookings. The app is integrated with Firebase for authentication and database management, and it leverages an AI-powered assistant to help users find alternative booking slots.

## Features

- **User Authentication**: Secure login and registration using Google (via Firebase Authentication).
- **Turf Browsing**: View a list of available sports turfs with details like location, price, and amenities.
- **Booking System**: An intuitive booking dialog to select dates and time slots.
- **Real-time Availability**: Check for booked slots in real-time, backed by Firestore.
- **AI Booking Assistant**: Get smart recommendations for alternative slots if your preferred time is unavailable.
- **Admin Panel**: A dedicated section for admins to view all bookings and manually add or remove them.
- **Dynamic Pricing**: Prices automatically adjust for peak hours and weekends.
- **WhatsApp Integration**: Seamlessly confirm bookings by redirecting users to WhatsApp with a pre-filled message.
- **Responsive Design**: A clean, modern UI that works across all devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **UI Components**: [Lucide React](https://lucide.dev/guide/packages/lucide-react) for icons.

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1.  Clone the repository:
    ```sh
    git clone <your-repository-url>
    ```
2.  Install NPM packages:
    ```sh
    npm install
    ```

### Environment Variables

Create a `.env` file in the root of your project and add the following environment variables. You'll need to get these from your Firebase project settings.

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"

# Admin Configuration (comma-separated for multiple admins)
NEXT_PUBLIC_ADMIN_EMAIL="your-admin-email@example.com"
NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER="your_whatsapp_number_with_country_code"
```

## Firebase Setup

This project uses Firebase for authentication (Google Sign-In) and Firestore as a database for bookings.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In the Project Settings, create a new Web App (`</>`).
3.  Copy the `firebaseConfig` object values into your `.env` file.
4.  Go to the **Authentication** section and enable the **Google** sign-in provider.
5.  Under Authentication settings, add `localhost` to the list of **Authorized domains**.
6.  Go to the **Firestore Database** section and create a new database in production mode.
7.  **Deploy Firestore rules**: Copy the contents of `firestore.rules` in this project into Firestore → Rules in the Firebase Console, then publish.
8.  **Set up admin access**: Either run `npm run seed` (see [docs/firebase-setup.md](docs/firebase-setup.md)) or manually create a document at `config/admins` with a field `emails` (array of strings), e.g. `["admin@example.com"]`. This must match `NEXT_PUBLIC_ADMIN_EMAIL` in your `.env`.

## Available Scripts

In the project directory, you can run:

-   `npm run dev`: Runs the app in development mode. Open [http://localhost:9002](http://localhost:9002) to view it in the browser.
-   `npm run seed`: Seeds Firestore with `config/admins` and default turfs (requires `GOOGLE_APPLICATION_CREDENTIALS`; see [docs/firebase-setup.md](docs/firebase-setup.md)).
-   `npm run build`: Builds the app for production.
-   `npm run start`: Starts a production server.
-   `npm run lint`: Lints the code for errors.
