export interface BloodRequest {
  _id: string;
  patientName: string;
  bloodGroup: string;
  hospitalName: string;
  location: string;
  urgencyLevel: string; // 'Urgent' | 'Normal'
  contactNumber: string;
  email: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface Donor {
  _id: string;
  name: string;
  bloodType: string;
  location: string;
}

export interface Profile {
  email: string;
  name: string;
  phone: string;
  bloodGroup: string;
  lastDonationDate: string;
  medicalEligibility: string;
}
