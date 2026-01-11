import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.godavari.pos',
  appName: 'Godavari POS',
  webDir: 'dist',
  server: {
    url: 'https://099e9905-0767-41b3-a5d9-b0f438e645cd.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
