import "better-auth";

declare module "better-auth" {
  interface User {
    role?: string;
    bloodGroup?: string;
    contactNumber?: string;
    lastDonationDate?: string;
    medicalEligibility?: boolean;
  }
}
