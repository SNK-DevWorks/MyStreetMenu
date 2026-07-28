'use server';

import { forgotPasswordSchema } from '@/lib/validations/auth.schema';
import type { ActionResponse } from '@/types/action-response';

export async function forgotPasswordAction(formData: FormData): Promise<ActionResponse> {
  const raw = {
    email: formData.get('email') as string,
  };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // TODO: Call Supabase Auth resetPasswordForEmail
    // const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);
    // if (error) throw error;

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send reset email' };
  }
}
