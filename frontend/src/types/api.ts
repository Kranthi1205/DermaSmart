export type Product = {
  name: string
  price: number
  description: string
  keyIngredients: string[]
  bestFor: string
  useTime: string
}

export type DermaReport = {
  overview: { condition: string }
  routine: { morning: string[]; evening: string[] }
  diet: { recommendations: string[] }
  products: Product[]
}

export type AnalyzeResponse = {
  status: 'success' | 'error'
  analysis_id?: string
  user_data?: { name: string; email: string; skin_type: string; age: number }
  skin_condition?: string
  is_emergency?: boolean
  dermaReport?: { report: DermaReport }
  message?: string
}
