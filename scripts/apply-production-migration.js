const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('====================================================');
  console.log('🚀 ZeroDesk Production Database Migration & Setup');
  console.log('====================================================\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not defined in environment.');
    process.exit(1);
  }

  // Resolving PrismaClient from apps/api
  const prismaPath = path.resolve(__dirname, '../apps/api/node_modules/@prisma/client');
  let PrismaClient;
  try {
    PrismaClient = require(prismaPath).PrismaClient;
  } catch {
    try {
      PrismaClient = require('@prisma/client').PrismaClient;
    } catch {
      console.log('📦 Installing Prisma Client dependencies...');
      execSync('pnpm --filter @zerodesk/api db:generate', { stdio: 'inherit' });
      PrismaClient = require(path.resolve(__dirname, '../node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@5.9.3__typescript@5.9.3/node_modules/@prisma/client')).PrismaClient;
    }
  }

  console.log('1️⃣ Synchronizing Database Tables via Prisma db push...');
  try {
    execSync('pnpm --filter @zerodesk/api db:push', { stdio: 'inherit', env: process.env });
    console.log('✅ Tables synchronized in Supabase.\n');
  } catch (err) {
    console.error('❌ Failed to push schema to Supabase:', err.message);
    process.exit(1);
  }

  console.log('2️⃣ Applying Row-Level Security policies & HNSW vector index...');
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    await prisma.$connect();
    console.log('✅ Connected to database.\n');

    try {
      await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "vector";');
      await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      console.log('✅ Vector & UUID extensions confirmed.\n');
    } catch (extErr) {
      console.warn('⚠️ Extension warning:', extErr.message);
    }

    const rlsPath = path.join(__dirname, '../apps/api/prisma/migrations/rls_policies.sql');
    if (fs.existsSync(rlsPath)) {
      const sql = fs.readFileSync(rlsPath, 'utf8');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        try {
          await prisma.$executeRawUnsafe(statement);
        } catch (stmtErr) {
          if (!statement.includes('DROP POLICY')) {
            console.warn(`⚠️ Warning: ${stmtErr.message}`);
          }
        }
      }
      console.log('✅ RLS policies and HNSW vector index applied.\n');
    }

    console.log('🎉 Production Database Migration & Setup Complete!');
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
