import { API_URL } from '../api-config';
import { Donor } from '../types';

export async function registerDonor(donorData: Omit<Donor, '_id'>): Promise<Donor> {
  const res = await fetch(`${API_URL}/api/donors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(donorData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to register donor');
  }
  return data;
}

export async function deleteDonor(id: string): Promise<Response> {
  const res = await fetch(`${API_URL}/api/donors/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete donor');
  }
  return res;
}
