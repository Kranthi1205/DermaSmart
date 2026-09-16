import React, { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { useNavigate } from 'react-router-dom'
import { validateFace } from '../lib/api'
import Stepper from '../components/Stepper'

export default function CameraPage(){
  const webcamRef = useRef<Webcam>(null)
  const [captured, setCaptured] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const capture = () => {
    const img = webcamRef.current?.getScreenshot()
    setCaptured(img || null)
  }

  const continueWithCapture = async () => {
    if (!captured) return
    setValidating(true)
    setError(null)
    try{
      const blob = await (await fetch(captured)).blob()
      const file = new File([blob],'photo.jpg',{type:'image/jpeg'})
      const res = await validateFace(file)
      if (res.valid) {
        navigate('/form', { state: file })
      } else {
        setError(res.reason || 'Validation failed')
      }
    }catch(e:any){
      setError('Could not connect to validation server. Please check your connection.')
    }finally{setValidating(false)}
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Stepper step={1} />
      <h2 className="text-xl font-semibold mb-4">Camera</h2>
      {!captured ? (
        <div className="bg-black rounded-md overflow-hidden" aria-live="polite">
          <Webcam audio={false} mirrored forceScreenshotSourceSize screenshotFormat="image/jpeg" videoConstraints={{width:{ideal:720},height:{ideal:720}, facingMode:'user'}} ref={webcamRef} />
        </div>
      ) : (
        <img src={captured} className="rounded-md" alt="Captured selfie" />
      )}

      <div className="mt-4 flex gap-3">
        <button className="px-4 py-2 bg-primary text-white rounded" onClick={capture}>Capture</button>
        {captured && <button className="px-4 py-2 bg-white border rounded" onClick={()=>setCaptured(null)}>Retake</button>}
        {captured && <button className="px-4 py-2 bg-accent text-white rounded" onClick={continueWithCapture} disabled={validating}>{validating? 'Checking...':'Continue'}</button>}
      </div>
      {error && <div role="alert" className="mt-4 text-red-600">{error}</div>}
    </main>
  )
}
