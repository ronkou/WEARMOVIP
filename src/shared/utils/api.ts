// utils/api.ts
// 統一的 API 請求工具，自動包含 credentials

/**
 * 包裝 fetch，自動添加 credentials: 'include'
 * 所有 API 請求都應使用這個函數，而不是原生 fetch
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
    headers: {
      ...(defaultOptions.headers as Record<string, string>),
      ...(options.headers as Record<string, string> || {}),
    },
  }

  const response = await fetch(url, mergedOptions)

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  return response
}

/**
 * 簡化的 GET 請求
 */
export async function apiGet(url: string, options: RequestInit = {}): Promise<any> {
  const res = await apiFetch(url, { ...options, method: 'GET' })
  return res.json()
}

/**
 * 簡化的 POST 請求
 */
export async function apiPost(url: string, data: any, options: RequestInit = {}): Promise<any> {
  const res = await apiFetch(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.json()
}

/**
 * 簡化的 PUT 請求
 */
export async function apiPut(url: string, data: any, options: RequestInit = {}): Promise<any> {
  const res = await apiFetch(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return res.json()
}

/**
 * 簡化的 DELETE 請求
 */
export async function apiDelete(url: string, options: RequestInit = {}): Promise<any> {
  const res = await apiFetch(url, { ...options, method: 'DELETE' })
  return res.json()
}
