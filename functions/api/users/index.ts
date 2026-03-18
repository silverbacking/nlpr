import { Env, hashPassword, jsonResponse, corsHeaders } from '../_shared/auth';

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: corsHeaders() });
};

// GET /api/users - list all users
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at ASC'
    ).all();
    return jsonResponse({ users: results });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

// DELETE /api/users?id=X - delete user
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');
    if (!id) return jsonResponse({ error: 'User id required' }, 400);

    const count = await context.env.DB.prepare('SELECT COUNT(*) as c FROM users').first();
    if (count && (count.c as number) <= 1) {
      return jsonResponse({ error: 'Cannot delete the last user' }, 400);
    }

    await context.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

// PUT /api/users - update user (role or password)
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { id: number; role?: string; password?: string };
    
    if (body.role) {
      await context.env.DB.prepare('UPDATE users SET role = ? WHERE id = ?')
        .bind(body.role, body.id).run();
    }
    
    if (body.password) {
      const hash = await hashPassword(body.password);
      await context.env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        .bind(hash, body.id).run();
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
