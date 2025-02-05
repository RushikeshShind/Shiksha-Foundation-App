import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shiksha.app',
  appName: 'Shiksha Foundation',
  webDir: 'dist', 
  server: {
    url: 'https://shiksha-foundation1.vercel.app/', 
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
