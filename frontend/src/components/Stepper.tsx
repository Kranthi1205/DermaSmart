import React from 'react'

export default function Stepper({ step=1 }: { step?: number }){
  const steps = ['Scan','Questions','Report']
  return (
    <div className="flex items-center gap-3">
      {steps.map((s,i)=> (
        <div key={s} className={`flex items-center gap-2 ${i>0?'ml-2':''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i+1===step ? 'bg-primary text-white':'bg-white border'}`}>{i+1}</div>
          <div className="hidden md:block text-sm">{s}</div>
        </div>
      ))}
    </div>
  )
}
