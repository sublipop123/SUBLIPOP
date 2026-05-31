#!/bin/bash
# Setup script for Firestore backup
# Run this once to configure the backup system

echo "=== Firestore Backup Setup ==="
echo ""
echo "You need a Firebase service account key to run backups."
echo ""
echo "Steps:"
echo "1. Go to https://console.firebase.google.com/project/sublipop-3ab61/settings/serviceaccounts"
echo "2. Click 'Generate new private key'"
echo "3. Save the JSON file as 'service-account.json' in this folder:"
echo "   /home/snofni/SOFTME/bin/backup/service-account.json"
echo ""
echo "Once you have the service-account.json file, run:"
echo "   cd /home/snofni/SOFTME/bin/backup && npm install"
echo ""
echo "To test the backup manually:"
echo "   cd /home/snofni/SOFTME/bin/backup && node backup.js"
echo ""
echo "To set up automatic daily backup at 3 AM:"
echo "   crontab -e"
echo "   # Add this line:"
echo "   0 3 * * * cd /home/snofni/SOFTME/bin/backup && /usr/bin/node backup.js >> /home/snofni/SOFTME/bin/backup/backup.log 2>&1"
echo ""

# Create data directory
mkdir -p /home/snofni/SOFTME/bin/backup/data

# Install dependencies
cd /home/snofni/SOFTME/bin/backup
npm install

echo ""
echo "Dependencies installed. Waiting for service-account.json..."