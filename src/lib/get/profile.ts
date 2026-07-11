import { API_URL } from '../api-config';
import { Profile } from '../types';

export async function fetchProfile(email: string): Promise<Profile> {
  const res = await fetch(`${API_URL}/api/profile?email=${encodeURIComponent(email)}`);
  if (!res.ok) {
    throw new Error('Failed to load profile details');
  }
  return res.json();
}
