import React, { useEffect, useState } from 'react'

export default function ThemeToggle(){
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(()=>{
    const root = document.documentElement
    if (dark) root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  },[dark])

  return (
    <button aria-pressed={dark} onClick={()=>setDark(d=>!d)} className="px-2 py-1 border rounded">
      {dark ? 'Dark' : 'Light'}
    </button>
  )
}
