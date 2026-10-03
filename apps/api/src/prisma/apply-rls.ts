const migrationInstructions = 'Direct RLS application is disabled. Review prisma/MIGRATION-ROLLOUT.md and run node scripts/apply-production-migration.js from the repository root.';

// Apply RLS only through the reviewed versioned migration chain.
export async function applyRls(): Promise<never> {
  throw new Error(migrationInstructions);
}

if (require.main === module) {
  console.error('Direct RLS application is disabled. Run node scripts/apply-production-migration.js after baseline review.');
  process.exitCode = 1;
}
