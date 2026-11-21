import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qxsj.app',
  appName: '情序手记',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
    backgroundColor: '#F7F6F2',
  },
};

export default config;
