/**
 * Restore script for Firestore data
 * Reads backup JSON and restores collections to Firestore
 * WARNING: This will overwrite existing data!
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, 'data');

// Initialize Firebase Admin
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function restoreCollection(collectionName, docs) {
  let restored = 0;
  let errors = 0;

  for (const doc of docs) {
    try {
      const { id, ...data } = doc;
      await db.collection(collectionName).doc(id).set(data);
      restored++;
    } catch (error) {
      console.error(`  Error restoring ${id}:`, error.message);
      errors++;
    }
  }

  return { restored, errors };
}

async function runRestore(filename) {
  const filepath = path.join(BACKUP_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.error(`Backup file not found: ${filename}`);
    console.log('\nAvailable backups:');
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));
    files.forEach(f => console.log(`  - ${f}`));
    return;
  }

  console.log('=== Firestore Restore Started ===');
  console.log('File:', filename);
  console.log('Time:', new Date().toISOString());
  console.log('');

  const backup = JSON.parse(fs.readFileSync(filepath, 'utf8'));

  // Confirm before proceeding
  const collections = Object.keys(backup.collections);
  console.log(`This will restore ${collections.length} collections:`);
  collections.forEach(col => {
    console.log(`  - ${col}: ${backup.collections[col].count} documents`);
  });
  console.log('\n⚠️  WARNING: Existing data will be overwritten!');
  console.log('');

  // Simple confirmation - check if backup is valid JSON
  let totalRestored = 0;
  let totalErrors = 0;

  for (const [colName, colData] of Object.entries(backup.collections)) {
    if (colData.error) {
      console.log(`\nSkipping ${colName} due to backup error: ${colData.error}`);
      continue;
    }

    console.log(`\nRestoring collection: ${colName}`);
    const result = await restoreCollection(colName, colData.data);
    totalRestored += result.restored;
    totalErrors += result.errors;
    console.log(`  → Restored: ${result.restored}, Errors: ${result.errors}`);
  }

  console.log('\n=== Restore Complete ===');
  console.log(`Total restored: ${totalRestored}`);
  if (totalErrors > 0) console.log(`Total errors: ${totalErrors}`);
}

// Run from command line: node restore.js backup-2024-01-15T03-00-00.json
const filename = process.argv[2];
if (!filename) {
  console.log('Usage: node restore.js <filename>');
  console.log('\nAvailable backups:');
  if (fs.existsSync(BACKUP_DIR)) {
    fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .forEach(f => console.log(`  - ${f}`));
  } else {
    console.log('  No backups found in', BACKUP_DIR);
  }
  process.exit(1);
}

runRestore(filename).catch(console.error);