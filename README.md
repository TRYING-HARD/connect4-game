# Connect 4 — Four in a Row

A polished two-player Connect 4 game with an online real-time mode and a local two-player mode.

## Features

- 7 × 6 standard Connect 4 board
- Online rooms with five-character game codes
- Real-time play with Socket.IO
- Player names and selectable avatars
- Persistent win score for the current room
- Rematch request: both online players must accept before a new round begins
- Share/copy game code
- Local two-player mode
- Sound effects with an on/off setting
- Responsive mobile/tablet/desktop design
- Installable as a PWA
- Android WebView wrapper project

## Run the web game locally

```bash
cd server
npm install
npm start
```

Open `http://localhost:3000` in two browser windows/devices.

## Deploy online

Deploy the `server` directory to a Node.js host that supports WebSockets/Socket.IO. Set `PORT` if your host requires it. Use HTTPS for production so the browser and Android app can use the secure connection.

## Build Android

1. Deploy the server and note its HTTPS URL.
2. Open `android` in Android Studio.
3. In `MainActivity.java`, replace `START_URL` with your HTTPS game URL.
4. Build a signed APK or Android App Bundle (AAB).

The Android app is a thin wrapper around the same web game, so feature updates can be deployed to the server without rebuilding the Android binary unless the native shell changes.

## Deploy with Render (free)

This repository includes `render.yaml`, so Render can detect the correct Node.js service settings automatically.

1. Create a new GitHub repository and upload this project.
2. In Render, choose **New + → Blueprint** and select the GitHub repository.
3. Render will read `render.yaml` and create the free web service.
4. Wait for the deployment to finish. Render will provide an HTTPS URL ending in `onrender.com`.
5. Use that URL as the Android `START_URL` in `android/app/src/main/java/.../MainActivity.java` before building the Android app.

The free service may sleep after a period without traffic; the first connection after sleeping can take a little longer. Socket.IO/WebSockets are used by the game and are supported by the web service configuration.
