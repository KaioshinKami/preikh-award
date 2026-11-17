import { getMessages } from '@/shared/i18n';
import { ERROR_MESSAGES } from './error-messages';

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  // A Blob (a file) is sent as is with its own type; anything else is sent as JSON.
  body?: unknown;
};

type ErrorPayload = { error?: string; code?: string } | null;

// The visitor's language for a coded error, else the server's own text, else a generic one.
function describeError(payload: ErrorPayload): string {
  const messages = getMessages(ERROR_MESSAGES);
  const code = payload?.code;
  const translated =
    code && Object.hasOwn(messages.codes, code)
      ? messages.codes[code as keyof typeof messages.codes]
      : undefined;
  return translated ?? payload?.error ?? messages.unknown;
}

// The session lives in an httpOnly cookie, so requests only need same-origin credentials.
export async function apiRequest<Response>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<Response> {
  const hasBody = body !== undefined;
  const isFile = body instanceof Blob;
  const response = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: hasBody ? { 'Content-Type': isFile ? body.type : 'application/json' } : undefined,
    body: isFile ? body : hasBody ? JSON.stringify(body) : undefined,
  }).catch(() => {
    throw new ApiRequestError(0, getMessages(ERROR_MESSAGES).network);
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiRequestError(response.status, describeError(payload as ErrorPayload));
  }

  return payload as Response;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : getMessages(ERROR_MESSAGES).unknown;
}
