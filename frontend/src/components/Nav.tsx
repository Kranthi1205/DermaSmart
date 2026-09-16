import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { AUTH0_ENABLED } from '../auth/auth-provider'
import { useAuth0 } from '@auth0/auth0-react'

export default function Nav(){
  const navigate = useNavigate()
  const auth = AUTH0_ENABLED ? useAuth0() : null

  const begin = async () => {
    if (!AUTH0_ENABLED) return navigate('/camera')
    if (auth && auth.isAuthenticated) return navigate('/camera')
    if (auth) await auth.loginWithRedirect()
  }

  return (
    <header className="bg-white border-b" role="banner">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to='/' className="text-lg font-semibold" aria-label="DermaSmart Home">DermaSmart</Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={begin} className="px-3 py-2 bg-primary text-white rounded" aria-label="Begin analysis">Begin</button>
        </div>
      </div>
    </header>
  )
}
