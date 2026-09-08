const path = require('path');
const { PrismaClient } = require(path.resolve('./apps/api/node_modules/@prisma/client'));

async function checkMigration() {
  console.log('==============================================');
  console.log('🔍 Checking Supabase Database Migration Status');
  console.log('==============================================\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL environment variable is not set.');
    return;
  }

  let formattedUrl = databaseUrl;
  if (formattedUrl.includes(':6543') && !formattedUrl.includes('pgbouncer=true')) {
    formattedUrl += (formattedUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
  const prisma = new PrismaClient({ datasources: { db: { url: formattedUrl } } });

  try {
    await prisma.$connect();
    console.log('✅ Connected to Supabase PostgreSQL.\n');

    // 1. Check Tables count
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename ASC;
    `;
    console.log(`📊 Total Public Tables Found: ${tables.length}`);
    console.log(`Tables: ${tables.map(t => t.tablename).join(', ')}\n`);

    // 2. Check Vector extension
    const extensions = await prisma.$queryRaw`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname IN ('vector', 'uuid-ossp');
    `;
    console.log('🧩 Installed Extensions:');
    extensions.forEach(ext => console.log(`   - ${ext.extname} (v${ext.extversion})`));
    console.log('');

    // 3. Check HNSW index
    const indexes = await prisma.$queryRaw`
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'knowledge_chunks' AND indexname = 'knowledge_chunks_embedding_hnsw_idx';
    `;
    if (indexes.length > 0) {
      console.log('⚡ HNSW Vector Index: ✅ ACTIVE (knowledge_chunks_embedding_hnsw_idx)\n');
    } else {
      console.log('⚠️ HNSW Vector Index: NOT FOUND (Run pnpm db:migrate:prod to apply)\n');
    }

    // 4. Check Seed Data (Tenants, Customers, Staff)
    const tenantCount = await prisma.tenant.count();
    const customerCount = await prisma.customer.count();
    const serviceCount = await prisma.service.count();

    console.log('🌱 Seed Data Status:');
    console.log(`   - Tenants:   ${tenantCount}`);
    console.log(`   - Customers: ${customerCount}`);
    console.log(`   - Services:  ${serviceCount}\n`);

    if (tables.length >= 20 && tenantCount > 0) {
      console.log('🎉 MIGRATION & SEEDING COMPLETED 100%! Ready for production.');
    } else if (tables.length >= 20) {
      console.log('✅ All tables exist! Ready for seeding (run "pnpm db:seed").');
    } else {
      console.log('⏳ Tables not yet created. Run "pnpm --filter @zerodesk/api db:push".');
    }
  } catch (err) {
    console.error('❌ Connection or Query Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigration();
