export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {}),
    },
  });

  return response;
}

export async function apiJson<T = unknown>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(input, init);
  const data = await response.json();
  if (!response.ok) {
    throw new Error((data as { error?: string }).error || 'Request failed.');
  }
  return data as T;
}
