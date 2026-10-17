import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Item } from "./models/Item";
import { User } from "./models/User";
import { ITEMS } from "./data/items";

// npm run seed. Run it once after the database is created, and again
// after anything that empties it. Nothing else in the project writes
// an item without a token.

async function seed() {
  await connectDB();

// Items require a postedBy ObjectId -- unlike courses, they belong
// to somebody. Upsert a seed user first so every item has a valid
// owner, without creating a duplicate on the second run.
let seedUser = await User.findOne({ email: "seed@lostfound.com" });
if (!seedUser) {
  seedUser = await User.create({
    name: "Seed Admin",
    email: "seed@lostfound.com",
    password: "seedpassword123",
    role: "admin",
  });
}

  for (const item of ITEMS) {
    // upsert: update the row with this title, or insert it if there is
    // none. Running this a second time leaves three items, not six.
    await Item.updateOne(
      { title: item.title },
      { ...item, postedBy: seedUser._id },
      { upsert: true }
    );
  }

  console.log(`${ITEMS.length} items in ${mongoose.connection.name}`);

  // Without this the script never ends: the connection is an open
  // socket, and Node keeps running while one is still open.
  await mongoose.disconnect();
}

seed().catch((err: unknown) => {
  console.error("Seed failed:", err);
  process.exit(1);
});