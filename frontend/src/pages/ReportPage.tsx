import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { submitFeedback } from '../lib/api'
import fallbackProducts from '../assets/Products.json'
import Stepper from '../components/Stepper'

export default function ReportPage(){
  const location = useLocation()
  const navigate = useNavigate()
  const data = (location.state as any)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  if (!data){
    return (
      <main className="p-6">
        <p>No report data. Start a new analysis.</p>
        <button className="mt-4 px-4 py-2 bg-primary text-white rounded" onClick={()=>navigate('/camera')}>Start new analysis</button>
      </main>
    )
  }

  const report = data.dermaReport?.report
  const isEmergency = !!data.is_emergency

  const productsToShow = (report && report.products && report.products.length>0) ? report.products : (!isEmergency ? fallbackProducts : [])

  const handleFeedback = async (isAcc:boolean) => {
    setSubmittingFeedback(true); setFeedbackError(null)
    try{
      await submitFeedback(data.analysis_id, isAcc, '')
      setFeedbackSent(true)
    }catch(e:any){
      setFeedbackError(e.message || 'Feedback failed')
    }finally{setSubmittingFeedback(false)}
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <Stepper step={3} />
      <header className="mb-4">
        <h2 className="text-2xl font-bold">Skin Intelligence Report</h2>
        <div className="text-slate-600">Condition: {data.skin_condition} — {report?.overview?.condition}</div>
      </header>

      {isEmergency && (
        <div role="alert" className="mb-4 p-4 rounded bg-red-50 border-l-4 border-red-600 text-red-800">
          <strong>EMERGENCY ALERT:</strong> High probability of a malignant lesion. Stop cosmetic routines and consult a certified dermatologist immediately.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <section className="md:col-span-2 bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Routine</h3>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Morning</h4>
              <ol className="list-decimal ml-5">{report?.routine?.morning?.map((s:string,i:number)=><li key={i}>{s}</li>)}</ol>
            </div>
            <div>
              <h4 className="font-medium">Evening</h4>
              <ol className="list-decimal ml-5">{report?.routine?.evening?.map((s:string,i:number)=><li key={i}>{s}</li>)}</ol>
            </div>
          </div>
        </section>

        <aside className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Diet</h3>
          <ul className="list-disc ml-5">{report?.diet?.recommendations?.map((r:string,i:number)=><li key={i}>{r}</li>)}</ul>

          {!isEmergency && (
            <div className="mt-4">
              <h3 className="font-semibold">Products</h3>
              <div className="mt-2 grid grid-cols-1 gap-3">
                {productsToShow.map((p:any, idx:number)=>(
                  <div key={idx} className="flex gap-3 items-center">
                    <img src={p.image} alt={p.name} className="w-20 h-14 object-cover rounded" onError={(e:any)=>{e.currentTarget.src='https://via.placeholder.com/300x200?text=Product'}} />
                    <div>
                      <div className="font-medium">{p.name} — ${p.price}</div>
                      <div className="text-sm text-slate-600">{p.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold">Feedback</h3>
            {isEmergency ? <div className="text-slate-600 text-sm mt-2">Feedback disabled for emergency alerts.</div> : (
              <div className="flex gap-2 mt-2">
                <button className="px-3 py-2 bg-primary text-white rounded" onClick={()=>handleFeedback(true)} disabled={submittingFeedback || feedbackSent}>{submittingFeedback? 'Sending...': feedbackSent ? 'Recorded' : 'Accurate'}</button>
                <button className="px-3 py-2 bg-white border rounded" onClick={()=>handleFeedback(false)} disabled={submittingFeedback || feedbackSent}>Not accurate</button>
              </div>
            )}
            {feedbackError && <div className="mt-2 text-red-600">{feedbackError}</div>}
            {feedbackSent && <div className="mt-2 text-green-600">Feedback recorded. Thank you!</div>}
          </div>
        </aside>
      </div>
    </main>
  )
}
