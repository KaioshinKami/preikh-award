export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
};

const NETWORK_ERROR_MESSAGE = 'Сервер недоступен. Попробуйте позже';

// The session lives in an httpOnly cookie, so requests only need same-origin credentials.
export async function apiRequest<Response>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<Response> {
  const hasBody = body !== undefined;
  const response = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  }).catch(() => {
    throw new ApiRequestError(0, NETWORK_ERROR_MESSAGE);
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const serverMessage = (payload as { error?: string } | null)?.error;
    throw new ApiRequestError(response.status, serverMessage ?? NETWORK_ERROR_MESSAGE);
  }

  return payload as Response;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Что-то пошло не так';
}
