import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { ApiError } from '../../api-error.ts';
import { hasErrorCode, UNIQUE_VIOLATION } from '../../db/sql.ts';
import { hashPassword, verifyPassword } from './password.ts';
import {
  clearSessionCookie,
  findSessionUser,
  setSessionCookie,
  type SessionUser,
} from './session.ts';

type RegisterBody = { name: string; email: string; password: string };
type LoginBody = { email: string; password: string };

const MIN_NAME_LENGTH = 2;
const CREDENTIALS_RATE_LIMIT = { rateLimit: { max: 10, timeWindow: '15 minutes' } };

const emailSchema = { type: 'string', format: 'email', maxLength: 254 };

const registerSchema = {
  body: {
    type: 'object',
    required: ['name', 'email', 'password'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: MIN_NAME_LENGTH, maxLength: 60 },
      email: emailSchema,
      password: { type: 'string', minLength: 8, maxLength: 128 },
    },
  },
};

const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    additionalProperties: false,
    properties: {
      email: emailSchema,
      password: { type: 'string', minLength: 1, maxLength: 128 },
    },
  },
};

// Verified against when the email is unknown, so a login takes the same time either way.
const DUMMY_PASSWORD_HASH = await hashPassword(randomUUID());

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterBody }>(
    '/register',
    { schema: registerSchema, config: CREDENTIALS_RATE_LIMIT },
    async (request, reply) => {
      const name = request.body.name.trim();
      if (name.length < MIN_NAME_LENGTH) throw new ApiError(400, 'Имя слишком короткое');

      const passwordHash = await hashPassword(request.body.password);
      let user: SessionUser;
      try {
        [user] = await app.sql<SessionUser[]>`
          insert into users (name, email, password_hash)
          values (${name}, ${normalizeEmail(request.body.email)}, ${passwordHash})
          returning id, name, email, role
        `;
      } catch (error) {
        if (hasErrorCode(error, UNIQUE_VIOLATION)) {
          throw new ApiError(409, 'Этот email уже зарегистрирован');
        }
        throw error;
      }

      await setSessionCookie(reply, user);
      return reply.code(201).send({ user });
    },
  );

  app.post<{ Body: LoginBody }>(
    '/login',
    { schema: loginSchema, config: CREDENTIALS_RATE_LIMIT },
    async (request, reply) => {
      const [account] = await app.sql<(SessionUser & { passwordHash: string })[]>`
        select id, name, email, role, password_hash from users
        where email = ${normalizeEmail(request.body.email)}
      `;
      const isPasswordValid = await verifyPassword(
        request.body.password,
        account?.passwordHash ?? DUMMY_PASSWORD_HASH,
      );
      if (!account || !isPasswordValid) throw new ApiError(401, 'Неверный email или пароль');

      const { passwordHash: _passwordHash, ...user } = account;
      await setSessionCookie(reply, user);
      return { user };
    },
  );

  app.post('/logout', async (_request, reply) => {
    clearSessionCookie(reply);
    return reply.code(204).send();
  });

  app.get('/me', async (request) => ({ user: await findSessionUser(request) }));
}
