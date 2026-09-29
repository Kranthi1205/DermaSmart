import { API_BASE_URL } from "../config"
import { AnalyzeResponse, ValidateFaceResponse } from "../types/api"

// The backend sleeps when idle and takes up to a minute to come back. A single
// request that lands during that window fails, which is what produced the
// "could not connect" screen on a site that was actually fine. So every call
// retries, and every page load nudges the server awake in the background.

const RETRY_DELAYS_MS = [2000, 4000, 8000, 12000, 15000]
const REQUEST_TIMEOUT_MS = 60000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const res = await fetch(url, { ...init, signal: controller.signal })

      // 5xx means the instance is up but not ready yet — worth another try.
      // A 4xx is a real answer about this request, so return it either way.
      if (res.status >= 500) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res
    } catch (err) {
      lastError = err
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt])
      }
    } finally {
      clearTimeout(timer)
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed")
}

/**
 * Fire-and-forget wake-up call, made as soon as the app loads. By the time the
 * user has framed a photo the instance is already running, so the first real
 * request does not have to wait for a cold start. Failures are ignored on
 * purpose — this is a nudge, not a dependency.
 */
export function warmUpBackend(): void {
  fetch(`${API_BASE_URL}/health`, { method: "GET" }).catch(() => {})
}

export async function validateFace(file: File): Promise<ValidateFaceResponse> {
  const formData = new FormData()
  formData.append("image", file)

  const res = await fetchWithRetry(`${API_BASE_URL}/validate-face`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }

  const data = await res.json()
  return data
}

interface AnalyzeInput {
  image: File
  skinType: "Oily" | "Dry" | "Combination"
  name?: string
  age?: number
  email?: string
}

export async function analyzeSkin(input: AnalyzeInput): Promise<AnalyzeResponse> {
  const formData = new FormData()
  formData.append("image", input.image)
  formData.append("skin_type", input.skinType)
  formData.append("name", input.name || "User")
  formData.append("age", (input.age || 25).toString())
  
  const email = input.email || `user_${Date.now()}@dermasmart.app`
  formData.append("email", email)

  const res = await fetchWithRetry(`${API_BASE_URL}/userInfo`, {
    method: "POST",
    body: formData,
  })

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
