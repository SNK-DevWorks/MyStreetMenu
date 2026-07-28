import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, type NewUser } from '../../drizzle/schema/users';

export const userRepository = {
  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  },

  async findAll() {
    return db.select().from(users);
  },

  async create(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  async update(id: string, data: Partial<NewUser>) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user ?? null;
  },

  async delete(id: string) {
    const [user] = await db.delete(users).where(eq(users.id, id)).returning();
    return user ?? null;
  },
};
