# Android Setup Guide for Godavari POS

## Step 1: Clone to a Safe Folder (Windows)

Avoid OneDrive-synced folders like Desktop. Use a local path instead:

```bash
cd C:\Projects
git clone https://github.com/veekshith-3110/godavari-sip-serve.git
cd godavari-sip-serve
npm install
```

## Step 2: Add Android Platform

```bash
npx cap add android
npx cap sync
```

## Step 3: Add Bluetooth Permissions (REQUIRED)

After cloning or adding Android, you **MUST** add these permissions to `android/app/src/main/AndroidManifest.xml`.

Paste these **before** the `<application>` tag:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

## Step 4: Build & Run

```bash
npm run build
npx cap sync
npx cap run android
```

## Important Notes

- ⚠️ **Every fresh clone loses the Bluetooth permissions** - always re-add them!
- Use Android Studio for debugging and building release APKs
- The app connects to the Lovable preview server for hot-reload during development
