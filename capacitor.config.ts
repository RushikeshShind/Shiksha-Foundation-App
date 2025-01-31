import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shiksha.foundation',
  appName: 'shiksha foundation',
  webDir: 'dist',
  "server": {
    "url": "https://shiksha-foundation1.vercel.app",
    "cleartext": true // Allow HTTP (if your website uses HTTP)
  }
};

export default config;
