import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";

console.log("MONGODB_URI =", process.env.MONGODB_URI);

const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db("StayNest");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    jwt()
  ],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      bloodGroup: {
        type: "string",
        required: false,
      },
      contactNumber: {
        type: "string",
        required: false,
      },
      lastDonationDate: {
        type: "string",
        required: false,
      },
      medicalEligibility: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
    },
  },
});

// Self-healing database seed: Clear stale demo users on server startup to resolve password mismatches
async function seedDemoUsers() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db("StayNest");
    const users = db.collection("user");
    const accounts = db.collection("account");

    const demoEmails = ["john@staynest.com", "admin@staynest.com"];
    // Find matching user records
    const existingDemoUsers = await users.find({ email: { $in: demoEmails } }).toArray();

    if (existingDemoUsers.length > 0) {
      const userIds = existingDemoUsers.map(u => u._id.toString());
      await users.deleteMany({ email: { $in: demoEmails } });
      await accounts.deleteMany({ userId: { $in: userIds } });
      console.log("Stale demo users and accounts cleared from MongoDB to prevent login mismatch.");
    }
    await client.close();
  } catch (error) {
    console.error("Error clearing stale demo users:", error);
  }
}

seedDemoUsers();