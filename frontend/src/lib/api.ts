import { API_BASE_URL } from "../config"
import { AnalyzeResponse, ValidateFaceResponse } from "../types/api"

export async function validateFace(file: File): Promise<ValidateFaceResponse> {
  const formData = new FormData()
  formData.append("image", file)

  const res = await fetch(`${API_BASE_URL}/validate-face`, {
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

  const res = await fetch(`${API_BASE_URL}/userInfo`, {
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
