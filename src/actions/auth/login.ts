'use server';

import { loginSchema } from '@/lib/validations/auth.schema';
import type { ActionResponse } from '@/types/action-response';

export async function loginAction(formData: FormData): Promise<ActionResponse> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // TODO: Call Supabase Auth signInWithPassword
    // const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
  }
}
