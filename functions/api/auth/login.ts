import { Env, verifyPassword, generateToken, jsonResponse, corsHeaders } from '../_shared/auth';

interface LoginBody {
  email: string;
  password: string;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: corsHeaders() });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as LoginBody;
    const { email, password } = body;

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password required' }, 400);
    }

    const user = await context.env.DB.prepare(
      'SELECT id, email, password_hash, name, role, created_at FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return jsonResponse({ error: 'Invalid email or password' }, 401);
    }

    const valid = await verifyPassword(password, user.password_hash as string);
    if (!valid) {
      return jsonResponse({ error: 'Invalid email or password' }, 401);
    }

    const token = generateToken();

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
