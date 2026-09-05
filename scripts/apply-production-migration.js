const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  console.log('====================================================');
  console.log('🚀 ZeroDesk Production Database Migration & Setup');
  console.log('====================================================\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL is not defined in environment.');
    process.exit(1);
  }

  console.log('1️⃣ Connecting to PostgreSQL...');
  const client = new Client({ connectionString: databaseUrl, ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('✅ Successfully connected to database.\n');

    console.log('2️⃣ Ensuring pgvector and uuid-ossp extensions exist...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "vector";');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ PostgreSQL extensions active.\n');

    console.log('3️⃣ Pushing Prisma Schema to database...');
    execSync('pnpm --filter @zerodesk/api db:push --skip-generate', { stdio: 'inherit' });
    console.log('✅ Prisma Schema synchronized.\n');

    console.log('4️⃣ Applying Row-Level Security (RLS) policies and HNSW vector index...');
    const rlsPath = path.join(__dirname, '../apps/api/prisma/migrations/rls_policies.sql');
    if (fs.existsSync(rlsPath)) {
      const sql = fs.readFileSync(rlsPath, 'utf8');
      await client.query(sql);
      console.log('✅ RLS policies and HNSW index applied successfully.\n');
    } else {
      console.warn('⚠️ rls_policies.sql not found at ' + rlsPath);
    }

    console.log('5️⃣ Verifying active RLS tables...');
    const rlsRes = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND rowsecurity = true;
    `);
    console.log(`✅ Protected RLS tables (${rlsRes.rowCount}): ${rlsRes.rows.map(r => r.tablename).join(', ')}\n`);

    console.log('6️⃣ Verifying HNSW vector index on knowledge_chunks...');
    const indexRes = await client.query(`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'knowledge_chunks' AND indexname = 'knowledge_chunks_embedding_hnsw_idx';
    `);
    if (indexRes.rowCount > 0) {
      console.log('✅ HNSW index confirmed active on knowledge_chunks(embedding vector_cosine_ops).\n');
    } else {
      console.warn('⚠️ HNSW index not found. Please review rls_policies.sql.\n');
    }

    console.log('🎉 Production Database Migration & Security Setup Complete!');
  } catch (err) {
    console.error('❌ Migration Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
