import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { motion } from 'framer-motion'
import { AUTH0_ENABLED } from '@/auth/auth-provider'

export default function HomePage() {
  const navigate = useNavigate()
  const { loginWithRedirect, isAuthenticated } = useAuth0()

  const handleBegin = () => {
    if (AUTH0_ENABLED && !isAuthenticated) {
      loginWithRedirect()
    } else {
      navigate('/camera')
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between items-center px-4 py-8 bg-[#1a1814] text-[#f5f0eb] select-none overflow-hidden">
      {/* Background radial glow */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 45%, rgba(229, 57, 53, 0.12) 0%, transparent 65%)`
        }}
      />

      {/* Top spacer */}
      <div className="h-4" />

      {/* Main Centered Content */}
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto my-auto"
      >
        {/* Minimalist circular badge / scan icon */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-[#e53935]/40 bg-[#241f1b]/80 flex items-center justify-center shadow-[0_0_30px_rgba(229,57,53,0.18)]">
            <svg
              className="w-7 h-7 text-[#f5f0eb]/90"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
              {/* Surrounding dots */}
              <circle cx="12" cy="2" r="0.8" fill="#e53935" stroke="none" />
              <circle cx="22" cy="12" r="0.8" fill="#e53935" stroke="none" />
              <circle cx="12" cy="22" r="0.8" fill="#e53935" stroke="none" />
              <circle cx="2" cy="12" r="0.8" fill="#e53935" stroke="none" />
            </svg>
          </div>
          {/* Subtle glow ring */}
          <div className="absolute inset-0 rounded-full border border-[#e53935]/20 animate-ping opacity-25 pointer-events-none" />
        </div>

        {/* Brand Title */}
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-serif tracking-normal font-normal text-[#f5f0eb] mb-3">
          DermaSmart
        </h1>

        {/* Subtitle tag */}
        <p className="text-xs sm:text-sm tracking-[0.28em] uppercase font-mono text-[#e53935] font-medium mb-5">
          AI POWERED SKIN INTELLIGENCE
        </p>

        {/* Description paragraph */}
        <p className="text-base sm:text-lg text-[#ede6db]/80 max-w-lg font-light leading-relaxed mb-10 px-2">
          Personalized dermatological analysis powered by<br className="hidden sm:inline" /> computer vision and clinical AI.
        </p>

        {/* CTA Button */}
        <button
          onClick={handleBegin}
          className="group relative inline-flex items-center justify-center px-10 py-3.5 rounded-full border border-[#e53935]/40 bg-[#28221e]/90 hover:bg-[#e53935] text-[#f5f0eb] text-sm font-medium tracking-wide transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_35px_rgba(229,57,53,0.45)] hover:border-[#e53935] hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Begin Analysis</span>
        </button>
      </motion.main>

      {/* Bottom Footer */}
      <footer className="relative z-10 text-center py-4">
        <p className="text-xs font-mono tracking-wider text-[#8c827a]">
          Built by <span className="text-[#e53935] font-medium">Kranthi Kumar</span>
        </p>
      </footer>
    </div>
  )
}
