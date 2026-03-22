# Firebase Token Helper

This utility helps you easily retrieve a Firebase ID Token using Google Sign-In. This token is useful for testing backend requests or authenticating with services that require strong identity verification.

## Prerequisites

- A Google Cloud / Firebase project.
- Access to [Google Cloud Shell](https://shell.cloud.google.com) (recommended) or a local development environment.

## Setup Instructions

### 1. Configure Firebase

1.  **Create a Web App**:
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Open your project.
    - Click the **Web** icon (</>) to create a new app.
    - Copy the `firebaseConfig` object provided.

2.  **Enable Google Sign-In**:
    - Navigate to **Authentication** > **Sign-in method**.
    - Click **Add new provider**.
    - Select **Google**.
    - Enable it and save.

3.  **Authorize Your Domain**:
    - This is critical for the helper to work in Cloud Shell.
    - Navigate to **Authentication** > **Settings**.
    - Scroll down to **Authorized domains**.
    - Click **Add domain**.
    - Add `cloudshell.dev` (this covers most Cloud Shell instances).
    - *If running locally, `localhost` is usually added by default.*

### 2. Configure the Helper

1.  Open `get_firebase_token.html` in your editor.
2.  Find the configuration section:
    ```javascript
    // --- IMPORTANT: REPLACE WITH YOUR FIREBASE CONFIG ---
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
    // --------------------------------------------------
    ```
3.  Replace that block with the config you copied from the Firebase Console.

## Running the Helper

We will use `live-server` to serve the HTML file.

1.  **Install live-server**:
    ```bash
    npm install -g live-server
    ```

2.  **Run the server**:
    In the `dashboard/helper` directory, run:
    ```bash
    live-server .
    ```

3.  **Get your Token**:
    - The tool should automatically open in your browser (or click the preview link in Cloud Shell).
    - **Click on `get_firebase_token.html`** in the file list to open the tool.
    - Click **Sign in with Google**.
    - Complete the sign-in flow.
    - Copy the **Firebase ID Token** from the text box.
