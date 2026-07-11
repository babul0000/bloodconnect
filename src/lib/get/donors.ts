import { API_URL } from '../api-config';
import { Donor } from '../types';

export async function fetchAllDonors(): Promise<Donor[]> {
  const res = await fetch(`${API_URL}/api/donors`);
  if (!res.ok) {
    throw new Error('Failed to fetch donors list');
  }
  return res.json();
}
