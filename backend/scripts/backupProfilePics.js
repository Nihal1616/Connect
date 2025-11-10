import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Backup users with profilePicture values that look like URLs
async function backup() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to DB');

    const users = await User.find({ profilePicture: { $exists: true, $ne: null } }).select('profilePicture name email username');

    const matches = users.filter(u => {
      const v = (u.profilePicture || '').toString();
      return v.includes('://');
    }).map(u => ({ id: u._id.toString(), profilePicture: u.profilePicture, name: u.name, email: u.email, username: u.username }));

    if (matches.length === 0) {
      console.log('No users with URL-like profilePicture values found. Nothing to backup.');
      process.exit(0);
    }

    const fileName = `backup_profilePics_${Date.now()}.json`;
    const outPath = path.join(process.cwd(), 'backend', 'scripts', fileName);
    fs.writeFileSync(outPath, JSON.stringify(matches, null, 2), 'utf8');

    console.log(`Wrote backup for ${matches.length} users to ${outPath}`);
    process.exit(0);
  } catch (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  }
}

backup();
