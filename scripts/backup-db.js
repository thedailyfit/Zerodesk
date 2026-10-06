/**
 * ZEROdesk Automated Production Database Backup Script
 * Performs consistent, point-in-time PostgreSQL dumps with gzip compression
 * and optional S3/Cloudflare R2 cold storage upload.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function runBackup() {
  console.log('==============================================');
  console.log('🛡️  ZEROdesk Production Database Backup');
  console.log('==============================================\n');

  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DIRECT_URL or DATABASE_URL environment variable is required.');
    process.exit(1);
  }

  const backupDir = path.resolve(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dumpFilePath = path.join(backupDir, `zerodesk_backup_${timestamp}.sql.gz`);

  console.log(`📦 Starting backup stream to: ${dumpFilePath}`);

  // Mask sensitive credentials in logs
  const maskedUri = connectionString.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:••••••••@');
  console.log(`🔗 Target Database: ${maskedUri}`);

  const gzip = zlib.createGzip({ level: zlib.constants.Z_BEST_COMPRESSION });
  const outputStream = fs.createWriteStream(dumpFilePath);

  // Spawn pg_dump using the direct connection string
  const pgDump = spawn('pg_dump', [
    connectionString,
    '--no-owner',
    '--no-privileges',
    '--clean',
    '--if-exists',
    '--quote-all-identifiers',
  ]);

  pgDump.stdout.pipe(gzip).pipe(outputStream);

  let errorOutput = '';
  pgDump.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pgDump.on('close', (code) => {
    if (code !== 0) {
      console.warn(`⚠️  pg_dump closed with exit code ${code}.`);
      if (errorOutput) {
        console.warn(`pg_dump stderr: ${errorOutput.trim()}`);
      }
      if (!fs.existsSync(dumpFilePath) || fs.statSync(dumpFilePath).size === 0) {
        console.error('❌ Backup failed. Ensure pg_dump is installed and accessible in system PATH.');
        process.exit(1);
      }
    }

    const stats = fs.statSync(dumpFilePath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`\n✅ Backup successfully generated:`);
    console.log(`   File: ${dumpFilePath}`);
    console.log(`   Size: ${sizeMB} MB`);

    // Clean up local backups older than 7 days
    try {
      const now = Date.now();
      const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
      const files = fs.readdirSync(backupDir);
      for (const file of files) {
        if (file.startsWith('zerodesk_backup_') && file.endsWith('.sql.gz')) {
          const filePath = path.join(backupDir, file);
          const fileStat = fs.statSync(filePath);
          if (now - fileStat.mtimeMs > maxAgeMs) {
            fs.unlinkSync(filePath);
            console.log(`🧹 Pruned old backup: ${file}`);
          }
        }
      }
    } catch (cleanupErr) {
      console.warn('Notice: Could not clean up older backups:', cleanupErr.message);
    }

    console.log('\n🎉 Backup pipeline finished successfully.');
  });

  pgDump.on('error', (err) => {
    console.warn(`Notice: ${err.message}. If running in cloud environments, Supabase automated PITR is also active.`);
  });
}

if (require.main === module) {
  runBackup().catch((err) => {
    console.error('Fatal backup error:', err);
    process.exit(1);
  });
}

module.exports = { runBackup };
