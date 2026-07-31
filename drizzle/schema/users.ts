import { pgTable, uuid, text, boolean, timestamp, pgEnum, type AnyPgColumn } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['vendor', 'admin']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Matches auth.users.id from Supabase
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  role: userRoleEnum('role').notNull().default('vendor'),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
