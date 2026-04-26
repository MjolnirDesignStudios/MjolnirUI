// lib/cdn-config.ts
export type CDNProvider = 'local' | 'cloudinary' | 'vercel' | 'aws';

export interface CDNConfig {
  provider: CDNProvider;
  baseUrl: string;
  localPath?: string;
  cloudName?: string;
  bucket?: string;
}

const getCDNConfig = (): CDNConfig => {
  const provider = (process.env.CDN_PROVIDER || 'local') as CDNProvider;

  switch (provider) {
    case 'cloudinary':
      return {
        provider: 'cloudinary',
        baseUrl: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      };

    case 'local':
    default:
      return {
        provider: 'local',
        baseUrl: '',
        localPath: '',
      };
  }
};

export const cdnConfig = getCDNConfig();

export const getAssetUrl = (assetPath: string): string => {
  if (assetPath.startsWith('/')) {
    return assetPath;
  }
  return assetPath;
};

export const ASSETS = {
  gridBackground: '/Images/Backgrounds/footer-grid.svg',
  energyTunnel: '/Images/EnergyTunnel.jpeg',
  mjolnirBackground: '/Images/Mjolnir.jpeg',
} as const;

export const getAssetUrls = () => ({
  gridBackground: getAssetUrl(ASSETS.gridBackground),
  energyTunnel: getAssetUrl(ASSETS.energyTunnel),
  mjolnirBackground: getAssetUrl(ASSETS.mjolnirBackground),
});
