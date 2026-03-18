import type { User, AuthState } from '../types';

const AUTH_KEY = 'nlpr_auth';
const USERS_KEY = 'nlpr_users';

interface StoredUser extends User {
  passwordHash: string;
}

// Simple hash for demo (NOT cryptographically secure - demo only)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + str.length;
}

function getDefaultUsers(): StoredUser[] {
  return [
    {
      id: 1,
      email: 'admin@silverbacking.com',
      passwordHash: simpleHash('admin123'),
      name: 'Admin',
      role: 'admin',
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 2,
      email: 'reviewer@silverbacking.com',
      passwordHash: simpleHash('reviewer123'),
      name: 'Jan de Vries',
      role: 'user',
      created_at: '2026-01-15T00:00:00Z',
    },
  ];
}

export function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const users = JSON.parse(raw);
      if (Array.isArray(users) && users.length > 0) return users;
    }
  } catch {}
  const defaults = getDefaultUsers();
  localStorage.setItem(USERS_KEY, JSON.stringify(defaults));
  return defaults;
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

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
  const users = getStoredUsers();
  const hash = simpleHash(password);
  const user = users.find((u) => u.email === email && u.passwordHash === hash);
  if (!user) throw new Error('Invalid email or password');
  
  const { passwordHash: _, ...userWithoutPassword } = user;
  const state: AuthState = {
    user: userWithoutPassword,
    token: 'jwt-' + Date.now() + '-' + Math.random().toString(36).slice(2),
  };
  storeAuth(state);
  return state;
}

export function getUsers(): User[] {
  return getStoredUsers().map(({ passwordHash: _, ...u }) => u);
}

export function addUser(name: string, email: string, password: string, role: 'admin' | 'user' = 'user'): User {
  const users = getStoredUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error('A user with this email already exists');
  }
  const newUser: StoredUser = {
    id: Date.now(),
    email,
    passwordHash: simpleHash(password),
    name,
    role,
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  const { passwordHash: _, ...u } = newUser;
  return u;
}

export function deleteUser(id: number): void {
  const users = getStoredUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === 0) throw new Error('Cannot delete the last user');
  saveUsers(filtered);
}

export function toggleUserRole(id: number): void {
  const users = getStoredUsers();
  const user = users.find((u) => u.id === id);
  if (user) {
    user.role = user.role === 'admin' ? 'user' : 'admin';
    saveUsers(users);
  }
}

export function changeUserPassword(id: number, newPassword: string): void {
  const users = getStoredUsers();
  const user = users.find((u) => u.id === id);
  if (user) {
    user.passwordHash = simpleHash(newPassword);
    saveUsers(users);
  }
}
