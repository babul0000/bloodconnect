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