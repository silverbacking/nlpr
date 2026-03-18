import { Env, jsonResponse, corsHeaders } from '../_shared/auth';

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { headers: corsHeaders() });
};

// GET /api/clients — get latest dataset
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const row = await context.env.DB.prepare(
      'SELECT id, name, data, uploaded_by, created_at FROM client_datasets ORDER BY id DESC LIMIT 1'
    ).first();
    
    if (!row) {
      return jsonResponse({ clients: [], name: null });
    }

    return jsonResponse({
      id: row.id,
      name: row.name,
      clients: JSON.parse(row.data as string),
      uploadedBy: row.uploaded_by,
      createdAt: row.created_at,
    });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

// POST /api/clients — save dataset
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { clients: unknown[]; name: string; uploadedBy?: string };
    
    if (!body.clients || !Array.isArray(body.clients)) {
      return jsonResponse({ error: 'clients array required' }, 400);
    }

    const data = JSON.stringify(body.clients);
    const result = await context.env.DB.prepare(
      'INSERT INTO client_datasets (name, data, uploaded_by) VALUES (?, ?, ?)'
    ).bind(body.name || 'Upload', data, body.uploadedBy || 'unknown').run();

    return jsonResponse({
      id: result.meta.last_row_id,
      count: body.clients.length,
    }, 201);
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};
