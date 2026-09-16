import { API_BASE_URL } from '../config'
import type { AnalyzeResponse } from '../types/api'

export async function validateFace(file: File): Promise<{ valid: boolean; reason?: string }>{
  const fd = new FormData()
  fd.append('image', file)
  const res = await fetch(`${API_BASE_URL}/validate-face`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Network error')
  return res.json()
}

export async function analyzeSkin(input: { image: File; skinType: 'Oily'|'Dry'|'Combination'; name?: string; age?: number; email?: string }): Promise<AnalyzeResponse>{
  const fd = new FormData()
  fd.append('image', input.image)
  fd.append('name', input.name || 'User')
  fd.append('skin_type', input.skinType)
  fd.append('age', String(input.age ?? 25))
  fd.append('email', input.email || `user_${Date.now()}@dermasmart.app`)

  const res = await fetch(`${API_BASE_URL}/userInfo`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error('Network error')
  const data = await res.json()
  if (data.status === 'error') throw new Error(data.message || 'Analysis error')
  return data as AnalyzeResponse
}

export async function submitFeedback(analysisId: string, isAccurate: boolean, comments = ''): Promise<void>{
  const res = await fetch(`${API_BASE_URL}/api/analyses/${analysisId}/feedback`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ is_accurate: isAccurate, comments })
  })
  if (!res.ok) throw new Error('Network error')
  const data = await res.json()
  if (data.status === 'error') throw new Error(data.message || 'Feedback error')
}
