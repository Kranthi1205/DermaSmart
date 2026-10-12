import { API_BASE_URL } from "../config"
import { AnalyzeResponse } from "../types/api"

// The free-tier backend sleeps when idle and can be slow or unreachable while it
// wakes. Retrying quietly for minutes left people staring at a spinner, so
// instead: nudge the server awake as soon as the app loads, probe it quickly
// before uploading anything, and fail fast with a clear message if it is not
// answering. A real request gets one quick retry for a transient failure.

const HEALTH_TIMEOUT_MS = 10000
const HEALTH_FRESH_MS = 60000
const ANALYZE_TIMEOUT_MS = 45000
const RETRY_DELAY_MS = 1000

export const BACKEND_UNAVAILABLE_MESSAGE =
  "The analysis server isn't responding right now. It may still be waking up, so please try again in a minute."

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

let lastHealthyAt = 0

/**
 * Asks the backend whether it is up, giving up after HEALTH_TIMEOUT_MS. A
 * timed-out request still reaches the host, which is what wakes a sleeping
 * instance, so a failed probe also leaves the server warming for the next try.
 */
export async function pingBackend(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/health`, { method: "GET" }, HEALTH_TIMEOUT_MS)
    if (res.ok) {
      lastHealthyAt = Date.now()
      return true
    }
  } catch {
    // unreachable or timed out — report as not ready
  }
  return false
}

/** Fire-and-forget wake-up call, made as soon as the app loads. */
export function warmUpBackend(): void {
  void pingBackend()
}

async function postWithRetry(url: string, body: FormData): Promise<Response> {
  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { method: "POST", body }, ANALYZE_TIMEOUT_MS)
      if (res.status < 500) return res
      lastError = new Error(`HTTP error! status: ${res.status}`)
    } catch (err) {
      // A timeout means the server is up but slow; retrying would just double
      // the wait. Only a quick network-level failure is worth a second try.
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("The analysis took too long to finish. Please try again.")
      }
      lastError = err
    }
    if (attempt === 0) await sleep(RETRY_DELAY_MS)
  }
  throw lastError instanceof Error ? lastError : new Error("Request failed")
}

interface AnalyzeInput {
  image: File
  skinType: "Oily" | "Dry" | "Combination"
  name?: string
  age?: number
  email?: string
}

export async function analyzeSkin(input: AnalyzeInput): Promise<AnalyzeResponse> {
  if (Date.now() - lastHealthyAt > HEALTH_FRESH_MS && !(await pingBackend())) {
    throw new Error(BACKEND_UNAVAILABLE_MESSAGE)
  }

  const formData = new FormData()
  formData.append("image", input.image)
  formData.append("skin_type", input.skinType)
  formData.append("name", input.name || "User")
  formData.append("age", (input.age || 25).toString())
  
  const email = input.email || `user_${Date.now()}@dermasmart.app`
  formData.append("email", email)

  const res = await postWithRetry(`${API_BASE_URL}/userInfo`, formData)

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }

  const data = await res.json()
  if (data.status === "error") {
    throw new Error(data.message || "Failed to analyze skin")
  }

  return data
}

export async function submitFeedback(analysisId: string, isAccurate: boolean, comments: string = ""): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/analyses/${analysisId}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_accurate: isAccurate, comments }),
  })

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }

  const data = await res.json()
  if (data.status === "error") {
    throw new Error(data.message || "Failed to submit feedback")
  }
}
