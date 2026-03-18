/**
 * POST /api/auth/register
 *
 * Accepts { email, password, name } and creates a new user account.
 * Returns the created user's public profile (no token -- the client should
 * redirect to the login page after successful registration).
 */

import {
  hashPassword,
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
      name?: string;
    };

    const { email, password, name } = body;

    // ------------------------------------------------------------------
    // Validate input
    // ------------------------------------------------------------------
    if (!email || !password || !name) {
      return errorResponse("Email, password, and name are required.", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters.", 400);
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse("Invalid email format.", 400);
    }

    // ------------------------------------------------------------------
    // Check for existing user
    // ------------------------------------------------------------------
    const existing = await context.env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    )
      .bind(email)
      .first();

    if (existing) {
      return errorResponse("A user with this email already exists.", 409);
    }

    // ------------------------------------------------------------------
    // Hash password and insert
    // ------------------------------------------------------------------
    const passwordHash = await hashPassword(password);

    const result = await context.env.DB.prepare(
      "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'user') RETURNING id, email, name, role, created_at"
    )
      .bind(email, passwordHash, name)
      .first<{
        id: number;
        email: string;
        name: string;
        role: string;
        created_at: string;
      }>();

    if (!result) {
      return errorResponse("Failed to create user.", 500);
    }

    return jsonResponse(
      {
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role,
          created_at: result.created_at,
        },
      },
      201
    );
  } catch (err: any) {
    console.error("Register error:", err);
    return errorResponse("Internal server error.", 500);
  }
};
