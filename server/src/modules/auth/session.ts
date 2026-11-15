import type { FastifyReply, FastifyRequest } from 'fastify';
import { ApiError } from '../../api-error.ts';

export const AUTH_COOKIE = 'preikh_session';
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export type UserRole = 'user' | 'admin';

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export async function setSessionCookie(reply: FastifyReply, user: SessionUser): Promise<void> {
  const token = await reply.jwtSign({ sub: String(user.id) }, { expiresIn: '7d' });
  reply.setCookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: reply.server.config.isProduction,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(AUTH_COOKIE, { path: '/' });
}

// The role is read from the database on every request, so a role change applies immediately.
export async function findSessionUser(request: FastifyRequest): Promise<SessionUser | null> {
  if (!request.cookies[AUTH_COOKIE]) return null;

  let userId: number;
  try {
    const payload = await request.jwtVerify<{ sub: string }>();
    userId = Number(payload.sub);
  } catch {
    return null;
  }

  const [user] = await request.server.sql<SessionUser[]>`
    select id, name, email, role from users where id = ${userId}
  `;
  return user ?? null;
}

export async function requireUser(request: FastifyRequest): Promise<void> {
  const user = await findSessionUser(request);
  if (!user) throw new ApiError(401, 'Войдите в аккаунт, чтобы продолжить');
  request.currentUser = user;
}

export async function requireAdmin(request: FastifyRequest): Promise<void> {
  await requireUser(request);
  if (request.currentUser?.role !== 'admin') {
    throw new ApiError(403, 'Раздел доступен только администратору');
  }
}

export function getCurrentUser(request: FastifyRequest): SessionUser {
  if (!request.currentUser) throw new ApiError(401, 'Войдите в аккаунт, чтобы продолжить');
  return request.currentUser;
}
