import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

// Thrown by handlers and services; the error handler turns it into `{ error }` with this status.
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const TOO_MANY_REQUESTS = 429;

export function handleError(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ApiError) return reply.code(error.status).send({ error: error.message });
  if (error.validation) {
    return reply.code(400).send({ error: 'Проверьте правильность заполнения полей' });
  }
  if (error.statusCode === TOO_MANY_REQUESTS) {
    return reply.code(TOO_MANY_REQUESTS).send({ error: 'Слишком много попыток. Попробуйте позже' });
  }
  if (error.statusCode && error.statusCode < 500) {
    return reply.code(error.statusCode).send({ error: error.message });
  }

  request.log.error(error);
  return reply.code(500).send({ error: 'Внутренняя ошибка сервера' });
}
