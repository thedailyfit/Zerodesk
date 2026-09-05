const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('====================================================');
  console.log('🚀 ZeroDesk Production Database Migration & Setup');
  console.log('====================================================\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not defined in environment.');
    process.exit(1);
  }

  console.log('1️⃣ Pushing Prisma Schema to Supabase...');
  try {
    execSync('pnpm --filter @zerodesk/api db:push', { stdio: 'inherit', env: process.env });
    console.log('✅ Prisma Schema synchronized (all tables created).\n');
  } catch (err) {
    console.error('❌ Failed to push schema to Supabase:', err.message);
    process.exit(1);
  }

  console.log('2️⃣ Initializing Prisma Client...');
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    await prisma.$connect();
    console.log('✅ Connected to database via Prisma.\n');

    console.log('3️⃣ Ensuring extensions exist (vector, uuid-ossp)...');
    try {
      await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "vector";');
      await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      console.log('✅ Extensions enabled.\n');
    } catch (extErr) {
      console.warn('⚠️ Note on extension creation:', extErr.message);
    }

    console.log('4️⃣ Applying Row-Level Security policies & HNSW vector index...');
    const rlsPath = path.join(__dirname, '../apps/api/prisma/migrations/rls_policies.sql');
    if (fs.existsSync(rlsPath)) {
      const sql = fs.readFileSync(rlsPath, 'utf8');
      // Split statements on semicolon
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        try {
          await prisma.$executeRawUnsafe(statement);
        } catch (stmtErr) {
          // Ignore individual policy drop errors if non-existent
          if (!statement.includes('DROP POLICY')) {
            console.warn(`⚠️ Warning executing statement: ${stmtErr.message}`);
          }
        }
      }
      console.log('✅ RLS policies and HNSW vector index applied.\n');
    }

    console.log('🎉 Production Database Migration & Security Setup Complete!');
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
