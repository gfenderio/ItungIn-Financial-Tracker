import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'id.itungin.finance',
    appName: 'ItungIn',
    webDir: 'dist',
    plugins: {
        SocialLogin: {
            google: {
                webClientId: '410398071381-um39gftnd1c2o7sndesugi27h9ab708n.apps.googleusercontent.com',
            }
        }
    }
};

export default config;

