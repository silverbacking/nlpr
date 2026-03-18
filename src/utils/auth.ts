import type { User, AuthState } from '../types';

const AUTH_KEY = 'nlpr_auth';

// For demo purposes, we use a local auth simulation
// In production, this would call the Cloudflare Workers API
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 1,
    email: 'admin@silverbacking.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'reviewer@silverbacking.com',
    password: 'reviewer123',
    name: 'Jan de Vries',
    role: 'user',
    created_at: '2026-01-15T00:00:00Z',
  },
];

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
  // Try API first, fall back to demo
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      const state: AuthState = { user: data.user, token: data.token };
      storeAuth(state);
      return state;
    }
  } catch {}

  // Demo fallback
  const user = DEMO_USERS.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password');
  const { password: _, ...userWithoutPassword } = user;
  const state: AuthState = {
    user: userWithoutPassword,
    token: 'demo-jwt-token-' + Date.now(),
  };
  storeAuth(state);
  return state;
}

export function getDemoUsers(): User[] {
  return DEMO_USERS.map(({ password: _, ...u }) => u);
}
