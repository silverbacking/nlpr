/**
 * /api/users
 *
 * Admin-only user management endpoints:
 *   GET    - List all users
 *   DELETE - Delete a user  (expects JSON body { id })
 *   PATCH  - Toggle a user's admin role (expects JSON body { id })
 *
 * All methods require a valid JWT in the Authorization header and the
 * authenticated user must have the "admin" role.
 */

import {
  authenticate,
  jsonResponse,
  errorResponse,
} from "../_shared/auth";

interface Env {
  DB: D1Database;
}

// ---------------------------------------------------------------------------
// GET /api/users  -- list all users
// ---------------------------------------------------------------------------

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const caller = await authenticate(context.request);
    if (!caller) {
      return errorResponse("Authentication required.", 401);
    }
    if (caller.role !== "admin") {
      return errorResponse("Admin access required.", 403);
    }

    const { results } = await context.env.DB.prepare(
      "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC"
    ).all<{
      id: number;
      email: string;
      name: string;
      role: string;
      created_at: string;
    }>();

    return jsonResponse({ users: results ?? [] });
  } catch (err: any) {
    console.error("List users error:", err);
    return errorResponse("Internal server error.", 500);
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/users  -- delete a user by id
// ---------------------------------------------------------------------------

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const caller = await authenticate(context.request);
    if (!caller) {
      return errorResponse("Authentication required.", 401);
    }
    if (caller.role !== "admin") {
      return errorResponse("Admin access required.", 403);
    }

    const body = (await context.request.json()) as { id?: number };
    const { id } = body;

    if (!id) {
      return errorResponse("User id is required.", 400);
    }

    // Prevent admins from deleting themselves
    if (id === caller.sub) {
      return errorResponse("You cannot delete your own account.", 400);
    }

    const existing = await context.env.DB.prepare(
      "SELECT id FROM users WHERE id = ?"
    )
      .bind(id)
      .first();

    if (!existing) {
      return errorResponse("User not found.", 404);
    }

    await context.env.DB.prepare("DELETE FROM users WHERE id = ?")
      .bind(id)
      .run();

    return jsonResponse({ success: true, deleted_id: id });
  } catch (err: any) {
    console.error("Delete user error:", err);
    return errorResponse("Internal server error.", 500);
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/users  -- toggle admin role for a user
// ---------------------------------------------------------------------------

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  try {
    const caller = await authenticate(context.request);
    if (!caller) {
      return errorResponse("Authentication required.", 401);
    }
    if (caller.role !== "admin") {
      return errorResponse("Admin access required.", 403);
    }

    const body = (await context.request.json()) as { id?: number };
    const { id } = body;

    if (!id) {
      return errorResponse("User id is required.", 400);
    }

    // Prevent admins from demoting themselves
    if (id === caller.sub) {
      return errorResponse("You cannot change your own role.", 400);
    }

    const user = await context.env.DB.prepare(
      "SELECT id, role FROM users WHERE id = ?"
    )
      .bind(id)
      .first<{ id: number; role: string }>();

    if (!user) {
      return errorResponse("User not found.", 404);
    }

    const newRole = user.role === "admin" ? "user" : "admin";

    await context.env.DB.prepare("UPDATE users SET role = ? WHERE id = ?")
      .bind(newRole, id)
      .run();

    // Return the updated user
    const updated = await context.env.DB.prepare(
      "SELECT id, email, name, role, created_at FROM users WHERE id = ?"
    )
      .bind(id)
      .first<{
        id: number;
        email: string;
        name: string;
        role: string;
        created_at: string;
      }>();

    return jsonResponse({ user: updated });
  } catch (err: any) {
    console.error("Toggle role error:", err);
    return errorResponse("Internal server error.", 500);
  }
};
