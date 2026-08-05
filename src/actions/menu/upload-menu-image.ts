'use server';

import { getCurrentUserId } from '@/lib/auth/get-user';
import { shopRepository } from '@/repositories';
import { imageUploadService } from '@/services/image-upload.service';
import type { ActionResponse } from '@/types/action-response';
import type { ImageType, OutputFormat } from '@/services/image-upload.service';

export async function uploadMenuImageAction(
  formData: FormData,
): Promise<ActionResponse<{ key: string }>> {
  try {
    // 1. Auth
    const userId = await getCurrentUserId();

    // 2. Extract fields
    const file = formData.get('file') as File | null;
    const shopId = formData.get('shopId') as string | null;
    const imageType = (formData.get('imageType') as ImageType | null) ?? 'menu';
    const format = (formData.get('format') as OutputFormat | null) ?? 'webp';

    console.log('[uploadMenuImage] file:', file?.name, 'size:', file?.size, 'type:', file?.type, 'shopId:', shopId);

    if (!file || !(file instanceof File)) {
      console.error('[uploadMenuImage] No file provided');
      return { success: false, error: 'No file provided.' };
    }
    if (!shopId) {
      console.error('[uploadMenuImage] Missing shopId');
      return { success: false, error: 'Missing shopId.' };
    }

    // 3. Verify shop ownership
    const shop = await shopRepository.findById(shopId);
    if (!shop) {
      console.error('[uploadMenuImage] Shop not found:', shopId);
      return { success: false, error: 'Shop not found.' };
    }
    if (shop.userId !== userId) {
      console.error('[uploadMenuImage] Unauthorized: userId mismatch');
      return { success: false, error: 'Unauthorized.' };
    }

    // 4. Convert File → Buffer for server-side processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('[uploadMenuImage] buffer size:', buffer.byteLength, 'bytes');

    // 5. Process + upload
    const { key } = await imageUploadService.processAndUploadImage(
      buffer,
      file.type,
      shopId,
      imageType,
      format,
    );

    console.log('[uploadMenuImage] Uploaded successfully, key:', key);
    return { success: true, data: { key } };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image upload failed.';
    console.error('[uploadMenuImage] Error:', message, error);
    return { success: false, error: message };
  }
}
