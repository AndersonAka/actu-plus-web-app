export {};

declare global {
  interface Window {
    axeptioSettings?: {
      clientId: string;
      cookiesVersion: string;
      googleConsentMode?: {
        default: {
          analytics_storage: string;
          ad_storage: string;
          ad_user_data: string;
          ad_personalization: string;
          wait_for_update: number;
        };
      };
    };
    _axcb?: Array<(axeptio: AxeptioSdk) => void>;
    openAxeptioCookies?: (settings?: unknown) => void;
    __axeptioActuPlusInit?: boolean;
  }
}

interface AxeptioSdk {
  on(event: 'cookies:complete', handler: (choices: Record<string, boolean>) => void): void;
  openCookies?: (settings?: unknown) => void;
}
