import QRCode from 'qrcode';

/**
 * Builds the canonical deep link URL for a specific fire detection device
 * formatted so that when scanned with a mobile phone camera, it opens the application
 * and automatically displays the SANS 10139 Device Maintenance Log.
 */
export const getDeviceDeepLinkUrl = (deviceId: string): string => {
  // In browser environment, construct origin-aware URL
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}?device=${encodeURIComponent(deviceId)}#device-sans-log`;
  }
  return `https://audrinfire.co.za/compliance/device?id=${encodeURIComponent(deviceId)}`;
};

/**
 * Generates a PNG Data URL for a given device deep link or raw text
 * using high error correction level 'H' (30% redundancy) to guarantee readability
 * in dusty industrial warehouse, factory, and healthcare environments.
 */
export const generateQrDataUrl = async (
  text: string,
  options?: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  }
): Promise<string> => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      width: options?.width || 250,
      margin: options?.margin !== undefined ? options?.margin : 1,
      color: {
        dark: options?.darkColor || '#0A192F',
        light: options?.lightColor || '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR Code Data URL:', err);
    // Return empty fallback string
    return '';
  }
};

/**
 * Generates an SVG string representation of the QR code.
 */
export const generateQrSvgString = async (
  text: string,
  options?: {
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  }
): Promise<string> => {
  try {
    return await QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: options?.margin !== undefined ? options?.margin : 1,
      color: {
        dark: options?.darkColor || '#0A192F',
        light: options?.lightColor || '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR Code SVG:', err);
    return '';
  }
};
