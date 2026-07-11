import { API_URL } from '../api-config';
import { Profile } from '../types';

export async function updateProfile(profileData: Profile): Promise<Response> {
  const res = await fetch(`${API_URL}/api/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to update profile');
  }
  return res;
}
