import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function AppNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#352f2a] bg-[#1a1814]/90 backdrop-blur">
      <div className="container flex h-14 items-center max-w-5xl mx-auto px-4 sm:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-[#e53935]" />
          <span className="font-serif text-xl tracking-wide font-normal text-[#f5f0eb]">DermaSmart</span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center gap-4">
            <span className="text-xs font-mono text-[#8c827a] tracking-widest uppercase">
              AI Clinical
            </span>
          </nav>
        </div>
      </div>
    </header>
  )
}
