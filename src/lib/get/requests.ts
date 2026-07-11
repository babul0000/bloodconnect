import { API_URL } from '../api-config';
import { BloodRequest } from '../types';

export async function fetchAllRequests(): Promise<BloodRequest[]> {
  const res = await fetch(`${API_URL}/api/requests`);
  if (!res.ok) {
    throw new Error('Failed to fetch blood requests');
  }
  return res.json();
}

export async function fetchUserRequests(email: string): Promise<BloodRequest[]> {
  const res = await fetch(`${API_URL}/api/requests?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    throw new Error('Failed to fetch user blood requests');
  }
  return res.json();
}

export async function fetchRequestById(id: string): Promise<BloodRequest> {
  const res = await fetch(`${API_URL}/api/requests/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch blood request details');
  }
  return res.json();
}
