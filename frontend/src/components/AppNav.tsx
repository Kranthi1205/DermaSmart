import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function AppNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center max-w-5xl mx-auto px-4 sm:px-6">
        <Link to="/" className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg hidden sm:inline-block">DermaSmart</span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center gap-4">
            {/* Dark mode toggle could go here */}
          </nav>
        </div>
      </div>
    </header>
  )
}
