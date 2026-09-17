export interface SkincareProduct {
  name: string
  price: number
  description: string
  keyIngredients: string[]
  bestFor: string
  useTime: string
}

export interface DermaReport {
  overview: { condition: string }
  routine: {
    morning: string[]
    evening: string[]
  }
  diet: {
    recommendations: string[]
  }
  products: SkincareProduct[]
}

export interface AnalyzeResponse {
  status: "success" | "error"
  analysis_id?: string
  user_data?: {
    name: string
    email: string
    skin_type: string
    age: number
  }
  skin_condition?: string
  is_emergency?: boolean
  dermaReport?: {
    report: DermaReport
  }
  message?: string
}

export interface ValidateFaceResponse {
  valid: boolean
  reason?: string
}
