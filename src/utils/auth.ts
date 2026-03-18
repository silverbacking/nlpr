import type { User, AuthState } from '../types';

const AUTH_KEY = 'nlpr_auth';

export function getStoredAuth(): AuthState {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { user: null, token: null };
}

export function storeAuth(state: AuthState): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

export async function login(email: string, password: string): Promise<AuthState> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  const state: AuthState = { user: data.user, token: data.token };
  storeAuth(state);
  return state;
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
  return data.users;
}

export async function addUser(name: string, email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create user');
  return data.user;
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete user');
}

export async function toggleUserRole(id: number, currentRole: string): Promise<void> {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  const res = await fetch('/api/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, role: newRole }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update role');
}

export async function changeUserPassword(id: number, newPassword: string): Promise<void> {
  const res = await fetch('/api/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change password');
}
