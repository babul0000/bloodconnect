import { API_URL } from '../api-config';
import { BloodRequest } from '../types';

export async function createRequest(formData: Omit<BloodRequest, '_id'> & { email: string }): Promise<BloodRequest> {
  const res = await fetch(`${API_URL}/api/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to post request');
  }
  return data;
}

export async function updateRequest(id: string, formData: Omit<BloodRequest, '_id' | 'email'>): Promise<Response> {
  const res = await fetch(`${API_URL}/api/requests/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update blood request');
  }
  return res;
}

export async function deleteRequest(id: string): Promise<Response> {
  const res = await fetch(`${API_URL}/api/requests/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete blood request');
  }
  return res;
}
