import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

// Machine-readable reasons for the errors a visitor of the site can run into. The site shows
// them in the visitor's language; `error` keeps a Russian text for anything without a code
// (the admin API, which is Russian only).
export type ErrorCode =
  | 'unauthorized'
  | 'name_too_short'
  | 'email_taken'
  | 'invalid_credentials'
  | 'voting_closed'
  | 'nominee_not_in_nomination'
  | 'already_voted'
  | 'nominee_name_required'
  | 'nomination_not_found'
  | 'already_nominee'
  | 'variant_not_found'
  | 'own_variant'
  | 'validation_failed'
  | 'too_many_requests'
  | 'internal_error';

// Thrown by handlers and services; the error handler turns it into `{ error, code }` with this status.
export class ApiError extends Error {
  status: number;
  code?: ErrorCode;

  constructor(status: number, message: string, code?: ErrorCode) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const TOO_MANY_REQUESTS = 429;
const PAYLOAD_TOO_LARGE = 413;
const UNSUPPORTED_MEDIA_TYPE = 415;

function send(reply: FastifyReply, status: number, error: string, code?: ErrorCode) {
  return reply.code(status).send(code ? { error, code } : { error });
}

export function handleError(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ApiError) return send(reply, error.status, error.message, error.code);
  if (error.validation) {
    return send(reply, 400, 'Проверьте правильность заполнения полей', 'validation_failed');
  }
  if (error.statusCode === TOO_MANY_REQUESTS) {
    return send(
      reply,
      TOO_MANY_REQUESTS,
      'Слишком много попыток. Попробуйте позже',
      'too_many_requests',
    );
  }
  if (error.statusCode === PAYLOAD_TOO_LARGE) {
    return send(reply, PAYLOAD_TOO_LARGE, 'Файл слишком большой');
  }
  if (error.statusCode === UNSUPPORTED_MEDIA_TYPE) {
    return send(reply, UNSUPPORTED_MEDIA_TYPE, 'Неподдерживаемый формат данных');
  }
  if (error.statusCode && error.statusCode < 500) {
    return send(reply, error.statusCode, error.message);
  }

  request.log.error(error);
  return send(reply, 500, 'Внутренняя ошибка сервера', 'internal_error');
}
