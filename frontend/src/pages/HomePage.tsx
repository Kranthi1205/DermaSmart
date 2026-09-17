import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { motion } from 'framer-motion'
import { Camera, ShieldCheck, BrainCircuit, ArrowRight } from 'lucide-react'
import { AppNav } from '@/components/AppNav'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
    <div className="flex min-h-screen flex-col">
      <AppNav />
      <main className="flex-1">
        <section className="py-20 md:py-32 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container max-w-4xl mx-auto space-y-8"
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-primary">
              Your skin's personal <br />
              <span className="text-accent">intelligence report.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Discover a tailored skincare routine powered by advanced AI. We analyze your skin's unique needs in seconds, providing expert-level guidance for your daily regimen.
            </p>
            <div className="pt-4 flex flex-col items-center gap-4">
              <Button size="lg" onClick={handleBegin} className="group text-lg px-8 h-14 rounded-full">
                Begin Analysis
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <p className="text-xs text-muted-foreground flex items-center">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Photos are processed in memory and never stored.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="py-16 bg-muted/50 px-4">
          <div className="container max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center mb-12">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-background/60 border-none shadow-sm">
                <CardHeader>
                  <Camera className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>1. Smart Capture</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Our on-device quality gate ensures your photo has perfect lighting and clarity before analysis begins.
                </CardContent>
              </Card>
              <Card className="bg-background/60 border-none shadow-sm">
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 text-accent mb-4" />
                  <CardTitle>2. Ethical Safety</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  An automatic intercept identifies potential high-risk conditions and prioritizes medical consultation.
                </CardContent>
              </Card>
              <Card className="bg-background/60 border-none shadow-sm">
                <CardHeader>
                  <BrainCircuit className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>3. AI Routine</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  Get a personalized morning and evening routine, dietary tips, and curated product recommendations.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
