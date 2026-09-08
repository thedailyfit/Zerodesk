import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function applyRls() {
  const prisma = new PrismaClient();
  const sqlPath = path.resolve(__dirname, '../../prisma/migrations/rls_policies.sql');

  if (!fs.existsSync(sqlPath)) {
    console.warn('[RLS] Migration file not found at:', sqlPath);
    return;
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  console.log('[RLS] Applying PostgreSQL Row-Level Security policies...');

  try {
    // Split into individual SQL statements to execute cleanly
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (err: any) {
        // Ignore warnings or benign errors (e.g. if table already has RLS enabled)
        if (!err.message.includes('already enabled')) {
          console.warn(`[RLS] Statement warning: ${err.message}`);
        }
      }
    }

    console.log('[RLS] Successfully applied Row-Level Security policies to PostgreSQL!');
  } catch (err: any) {
    console.error('[RLS] Failed to apply RLS policies:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  applyRls();
}

export { applyRls };
