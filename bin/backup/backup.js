/**
 * Firestore Backup Script
 * Exports all collections to JSON and saves to /home/snofni/SOFTME/bin/backup/data/
 * Run via cron: 0 3 * * * cd /home/snofni/SOFTME/bin/backup && node backup.js
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, 'data');
const RETENTION_DAYS = 30; // Keep backups for 30 days

// Initialize Firebase Admin
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function backupCollection(collectionName) {
  try {
    const snapshot = await db.collection(collectionName).get();
    const docs = [];

    snapshot.forEach(doc => {
      docs.push({ id: doc.id, ...doc.data() });
    });

    return { collection: collectionName, count: docs.length, data: docs };
  } catch (error) {
    console.error(`Error backing up ${collectionName}:`, error.message);
    return { collection: collectionName, count: 0, data: [], error: error.message };
  }
}

async function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // newest first

    const cutoff = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);

    let deleted = 0;
    for (const file of files) {
      if (file.time < cutoff) {
        fs.unlinkSync(file.path);
        deleted++;
        console.log(`Deleted old backup: ${file.name}`);
      }
    }
    return deleted;
  } catch (error) {
    console.error('Error cleaning old backups:', error.message);
    return 0;
  }
}

async function runBackup() {
  console.log('=== Firestore Backup Started ===');
  console.log('Time:', new Date().toISOString());

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  // Collections to backup
  const collections = [
    'productos',
    'categorias',
    'tickets',
    'usuarios',
    'config',
    'modelos3d'
  ];

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = {
    timestamp,
    exportedAt: new Date().toISOString(),
    collections: {}
  };

  let totalDocs = 0;

  for (const col of collections) {
    console.log(`\nBacking up collection: ${col}`);
    const result = await backupCollection(col);
    backup.collections[col] = result;
    totalDocs += result.count;
    console.log(`  → ${result.count} documents`);
    if (result.error) console.log(`  → Error: ${result.error}`);
  }

  // Save backup file
  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

  console.log(`\n✓ Backup saved: ${filename}`);
  console.log(`  Total documents: ${totalDocs}`);
  console.log(`  File size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

  // Clean old backups
  const deleted = await cleanOldBackups();
  if (deleted > 0) console.log(`\n✓ Cleaned ${deleted} old backup(s)`);

  console.log('\n=== Backup Complete ===');
}

runBackup().catch(console.error);