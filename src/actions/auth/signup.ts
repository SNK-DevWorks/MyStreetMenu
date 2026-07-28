'use server';

import { signupSchema } from '@/lib/validations/auth.schema';
import { authService } from '@/services';
import type { ActionResponse } from '@/types/action-response';

export async function signupAction(formData: FormData): Promise<ActionResponse> {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    phone: (formData.get('phone') as string) || undefined,
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    // TODO: Step 1 — Create Supabase Auth user
    // const { data: authData, error: authError } = await supabase.auth.signUp({
    //   email: parsed.data.email,
    //   password: parsed.data.password,
    // });
    // if (authError) throw authError;

    // Step 2 — Create user profile in our database
    // await authService.signup({
    //   id: authData.user.id,
    //   name: parsed.data.name,
    //   phone: parsed.data.phone,
    // });

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Signup failed' };
  }
}
