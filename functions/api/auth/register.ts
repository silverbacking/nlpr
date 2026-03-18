import { Env, hashPassword, jsonResponse, corsHeaders } from '../_shared/auth';

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: corsHeaders() });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as RegisterBody;
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return jsonResponse({ error: 'Email, password and name are required' }, 400);
    }

    const existing = await context.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existing) {
      return jsonResponse({ error: 'A user with this email already exists' }, 409);
    }

    const passwordHash = await hashPassword(password);
    const result = await context.env.DB.prepare(
      'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
    ).bind(email, passwordHash, name, role || 'user').run();

    return jsonResponse({
      user: {
        id: result.meta.last_row_id,
        email,
        name,
        role: role || 'user',
        created_at: new Date().toISOString(),
      },
    }, 201);
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
