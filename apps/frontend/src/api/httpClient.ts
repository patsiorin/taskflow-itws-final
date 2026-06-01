import { API_ROOT } from './endpoints';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | object | null;
};

export async function httpClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body && typeof options.body === 'object' ? JSON.stringify(options.body) : options.body,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
