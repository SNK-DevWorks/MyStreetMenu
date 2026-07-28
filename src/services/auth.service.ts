import { userRepository } from '@/repositories';
import type { NewUser } from '../../drizzle/schema/users';

/**
 * Auth service — handles user creation on signup and profile retrieval.
 * Actual authentication (email/password/sessions) is handled by Supabase Auth.
 */
export const authService = {
  /**
   * Create user profile after Supabase Auth signup.
   * The id must match the Supabase auth.users.id.
   */
  async signup(data: { id: string; name: string; phone?: string }) {
    const existing = await userRepository.findById(data.id);
    if (existing) {
      throw new Error('User profile already exists');
    }

    const user = await userRepository.create({
      id: data.id,
      name: data.name,
      phone: data.phone,
      role: 'vendor',
    });

    return user;
  },

  /**
   * Get the current user's profile by their Supabase auth id.
   */
  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  /**
   * Update user profile.
   */
  async updateProfile(userId: string, data: Partial<NewUser>) {
    const user = await userRepository.update(userId, data);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },
};
