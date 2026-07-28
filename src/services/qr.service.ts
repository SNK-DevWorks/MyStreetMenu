import { shopRepository } from '@/repositories';

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * QR service — no database table needed.
 * QR codes are always generated from the shop's menu URL.
 */
export const qrService = {
  /**
   * Get the QR code URL for a shop.
   */
  getQRUrl(shopSlug: string): string {
    return `${BASE_URL}/menu/${shopSlug}`;
  },

  /**
   * Generate QR code data URL (SVG/PNG) for a shop.
   * Uses the `qrcode` npm package already installed.
   */
  async generateQRCode(shopSlug: string): Promise<string> {
    const QRCode = await import('qrcode');
    const url = this.getQRUrl(shopSlug);
    const dataUrl = await QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return dataUrl;
  },

  /**
   * Generate QR code for a vendor's shop by user ID.
   */
  async generateQRCodeForVendor(userId: string): Promise<{ url: string; dataUrl: string }> {
    const shop = await shopRepository.findByUserId(userId);
    if (!shop) throw new Error('Shop not found');

    const url = this.getQRUrl(shop.slug);
    const dataUrl = await this.generateQRCode(shop.slug);

    return { url, dataUrl };
  },
};
