import React from 'react'

type Props = {
  options: string[]
  value: string
  onChange: (v:string)=>void
}

export default function OptionPills({ options, value, onChange }: Props){
  return (
    <div role="radiogroup" className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={opt}
          role="radio"
          aria-checked={value===opt}
          onClick={()=>onChange(opt)}
          className={`px-3 py-1 rounded-full border ${value===opt ? 'bg-primary text-white' : 'bg-white'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
