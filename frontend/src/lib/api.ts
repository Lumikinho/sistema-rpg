const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:9090"

export interface ApiFieldError {
  field: string
  message: string
}

export class ApiError extends Error {
  status: number
  errors?: ApiFieldError[]

  constructor(message: string, status: number, errors?: ApiFieldError[]) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.errors = errors
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body } = options

  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.message ?? "Não foi possível falar com o servidor. Tente de novo."
    throw new ApiError(message, response.status, data?.errors)
  }

  return data as T
}
