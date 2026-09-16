import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function HomePage(){
  const navigate = useNavigate()
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <header className="py-8 text-center">
        <h1 className="text-3xl font-bold">DermaSmart — AI Skin Analysis</h1>
        <p className="mt-2 text-slate-600">Quick, non-diagnostic skin intelligence.</p>
        <div className="mt-6">
          <button className="px-6 py-3 bg-primary text-white rounded-md" onClick={()=>navigate('/camera')}>Begin Analysis</button>
        </div>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-white rounded shadow">Image gating</div>
        <div className="p-4 bg-white rounded shadow">Ethical safety intercept</div>
        <div className="p-4 bg-white rounded shadow">AI routine</div>
      </section>
    </main>
  )
}
