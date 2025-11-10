import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import path from 'path';

dotenv.config();

// Usage:
// node normalizeProfilePics.js        # dry-run (shows what would change)
// node normalizeProfilePics.js --apply  # actually update DB

const APPLY = process.argv.includes('--apply');

async function normalize() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to DB');

    const users = await User.find({ profilePicture: { $exists: true, $ne: null } });
    let updated = 0;
    let toUpdate = [];

    for (const user of users) {
      const pic = user.profilePicture;
      if (!pic) continue;
      try {
        if (typeof pic === 'string' && (pic.startsWith('http://') || pic.startsWith('https://') || pic.includes('://'))) {
          // extract basename from URL path
          const url = new URL(pic);
          const basename = path.basename(url.pathname);
          if (basename && basename !== pic) {
            toUpdate.push({ id: user._id, from: pic, to: basename });
          }
        }
      } catch (err) {
        console.warn('Skipping user', user._id, err.message);
      }
    }

    if (toUpdate.length === 0) {
      console.log('Dry-run: no users require normalization.');
      process.exit(0);
    }

    console.log(`Found ${toUpdate.length} users that would be updated:`);
    toUpdate.forEach((u) => console.log(`  ${u.id} -> ${u.to}`));

    if (!APPLY) {
      console.log('\nDry-run complete. Rerun with --apply to make changes.');
      process.exit(0);
    }

    // Apply changes
    for (const u of toUpdate) {
      try {
        await User.updateOne({ _id: u.id }, { profilePicture: u.to });
        updated++;
        console.log(`Updated user ${u.id} -> ${u.to}`);
      } catch (err) {
        console.warn('Failed to update user', u.id, err.message);
      }
    }

    console.log(`Done. Updated ${updated} users.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

normalize();
