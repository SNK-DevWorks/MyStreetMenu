import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../../drizzle';

const connectionString = process.env.DATABASE_URL || '';

export const db = drizzle({ connection: connectionString, schema });
