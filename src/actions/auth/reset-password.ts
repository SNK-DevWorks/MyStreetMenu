'use server';

import { resetPasswordSchema } from '@/lib/validations/auth.schema';
import type { ActionResponse } from '@/types/action-response';

export async function resetPasswordAction(formData: FormData): Promise<ActionResponse> {
  const raw = {
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // TODO: Call Supabase Auth updateUser
    // const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    // if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reset password' };
  }
}
