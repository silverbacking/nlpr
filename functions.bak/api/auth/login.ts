/**
 * POST /api/auth/login
 *
 * Accepts { email, password } and returns a JWT token together with the
 * authenticated user's public profile data.
 */

import {
  verifyPassword,
  createToken,
  jsonResponse,
  errorResponse,
} from "../_shared/auth";

interface Env {
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as {
      email?: string;
      password?: string;
    };

    const { email, password } = body;

    // ------------------------------------------------------------------
    // Validate input
    // ------------------------------------------------------------------
    if (!email || !password) {
      return errorResponse("Email and password are required.", 400);
    }

    // ------------------------------------------------------------------
    // Look up user in D1
    // ------------------------------------------------------------------
    const user = await context.env.DB.prepare(
      "SELECT id, email, password_hash, name, role, created_at FROM users WHERE email = ?"
    )
      .bind(email)
      .first<{
        id: number;
        email: string;
        password_hash: string;
        name: string;
        role: string;
        created_at: string;
      }>();

    if (!user) {
      return errorResponse("Invalid email or password.", 401);
    }

    // ------------------------------------------------------------------
    // Verify password
    // ------------------------------------------------------------------
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
      return errorResponse("Invalid email or password.", 401);
    }

    // ------------------------------------------------------------------
    // Issue JWT
    // ------------------------------------------------------------------
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return jsonResponse({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return errorResponse("Internal server error.", 500);
  }
};
