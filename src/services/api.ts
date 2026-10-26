import type { DashboardSummary, ReportDTO, ReportHistory, ReportInput, ReviewInput, SessionDTO, WorkerDTO } from "../api/contracts"

const baseUrl = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "")
export const API_MODE = import.meta.env.VITE_DATA_MODE === "api"

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

let csrfToken = ""
export function setCsrfToken(value: string) {
  csrfToken = value
}

function makeKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now()}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`
}

async function request<T>(path: string, options: RequestInit = {}, key?: string): Promise<T> {
  const headers = new Headers(options.headers)
  const hasBody = options.body !== undefined
  if (hasBody && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json")
  if (key) headers.set("Idempotency-Key", key)
  if (options.method && options.method !== "GET" && csrfToken) headers.set("X-CSRF-Token", csrfToken)
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, { ...options, headers, credentials: "same-origin" })
  } catch {
    throw new ApiError(0, "The ReClaim API could not be reached. Your draft remains on this device.")
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = typeof body?.detail === "string" ? body.detail : `ReClaim request failed (${response.status})`
    throw new ApiError(response.status, message)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function readSession() {
  return request<SessionDTO>("/auth/session")
}

export function startGuestSession() {
  return request<SessionDTO>("/auth/guest", { method: "POST" })
}

export function login(username: string, password: string) {
  return request<SessionDTO>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) })
}

export function logout() {
  return request<void>("/auth/logout", { method: "POST" })
}

export function createReport(input: ReportInput, key: string) {
  return request<ReportDTO>("/reports", { method: "POST", body: JSON.stringify(input) }, key)
}

export function getReport(id: string, signal?: AbortSignal) {
  return request<ReportDTO>(`/reports/${encodeURIComponent(id)}`, { signal })
}

export function listReports(disasterId: string, role: Exclude<SessionDTO["role"], "govt">) {
  const params = new URLSearchParams({ disasterId, limit: "100" })
  return request<{ items: ReportDTO[]; total: number; nextCursor: string | null }>(`/reports?${params}`, { method: "GET" })
}

export function uploadEvidence(id: string, file: File, version: number, key: string) {
  const body = new FormData()
  body.set("file", file)
  return request<ReportDTO>(`/reports/${encodeURIComponent(id)}/evidence`, {
    method: "POST", headers: { "If-Match": `"${version}"` }, body,
  }, key)
}

export function analyzeReport(id: string) {
  return request<{ state: "rules_only"; message: string; priority: ReportDTO["priority"] }>(
    `/reports/${encodeURIComponent(id)}/analysis`, { method: "POST", body: "{}" }, makeKey(),
  )
}

export function assignReport(id: string, workerId: string | null, version: number, key: string) {
  return request<ReportDTO>(`/reports/${encodeURIComponent(id)}/assignment`, {
    method: "PUT", headers: { "If-Match": `"${version}"` }, body: JSON.stringify({ workerId }),
  }, key)
}

export function reviewReport(id: string, input: ReviewInput, version: number, key: string) {
  return request<ReportDTO>(`/reports/${encodeURIComponent(id)}/reviews`, {
    method: "POST", headers: { "If-Match": `"${version}"` }, body: JSON.stringify(input),
  }, key)
}

export function getSummary(disasterId: string) {
  return request<DashboardSummary>(`/dashboard/summary?${new URLSearchParams({ disasterId })}`)
}

export function getReportHistory(id: string) {
  return request<ReportHistory>(`/reports/${encodeURIComponent(id)}/history`)
}

export function evidenceContentUrl(id: string) {
  return `${baseUrl}/evidence/${encodeURIComponent(id)}/content`
}

export function getWorkers(disasterId: string) {
  return request<{ items: WorkerDTO[] }>(`/workers?${new URLSearchParams({ disasterId })}`)
}
