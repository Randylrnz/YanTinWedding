import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-dev-secret";
const COOKIE_NAME = "yantin_admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyAdminToken(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function getAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getAdminToken();
  if (!token) return false;
  return verifyAdminToken(token);
}

export function getAdminTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value ?? null;
}

export function isAdminAuthenticatedFromRequest(req: NextRequest): boolean {
  const token = getAdminTokenFromRequest(req);
  if (!token) return false;
  return verifyAdminToken(token);
}

export { COOKIE_NAME, COOKIE_MAX_AGE };
