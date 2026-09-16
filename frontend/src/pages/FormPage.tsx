import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { analyzeSkin } from '../lib/api'
import OptionPills from '../components/OptionPills'
import Stepper from '../components/Stepper'

export default function FormPage(){
  const location = useLocation()
  const navigate = useNavigate()
  const file = (location.state as any) as File | undefined
  const [isOily, setIsOily] = useState('Not at all')
  const [isDry, setIsDry] = useState('Not at all')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!file) {
    return (
      <main className="p-6">
        <p>No image provided. Please start at the camera.</p>
        <button className="mt-4 px-4 py-2 bg-primary text-white rounded" onClick={()=>navigate('/camera')}>Back to Camera</button>
      </main>
    )
  }

  const options = ['Not at all','Unlikely','Somewhat','Likely','Definitely']

  const detectSkinType = () => {
    if (isOily === 'Likely' || isOily === 'Definitely') return 'Oily'
    if (isDry === 'Likely' || isDry === 'Definitely') return 'Dry'
    return 'Combination'
  }

  const submit = async () => {
    setSubmitting(true); setError(null)
    try{
      const res = await analyzeSkin({ image: file, skinType: detectSkinType() as any })
      navigate('/report', { state: res })
    }catch(e:any){
      setError(e.message || 'Submission failed')
    }finally{setSubmitting(false)}
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <Stepper step={2} />
      <h2 className="text-xl font-semibold">Skin Questionnaire</h2>
      <div className="mt-4">
        <label className="block font-medium">How oily does your skin feel?</label>
        <div className="mt-2"><OptionPills options={options} value={isOily} onChange={setIsOily} /></div>
      </div>

      <div className="mt-4">
        <label className="block font-medium">How dry or tight does your skin feel?</label>
        <div className="mt-2"><OptionPills options={options} value={isDry} onChange={setIsDry} /></div>
      </div>

      <div className="mt-6 flex flex-col md:flex-row md:items-center md:gap-3">
        <button className="px-4 py-2 bg-primary text-white rounded" onClick={submit} disabled={submitting} aria-busy={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
        <div className="py-2">Detected skin type: <strong>{detectSkinType()}</strong></div>
      </div>
      {error && <div className="mt-4 text-red-600">{error}</div>}
    </main>
  )
}
