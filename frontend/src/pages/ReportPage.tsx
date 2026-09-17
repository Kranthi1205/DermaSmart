import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, ThumbsUp, ThumbsDown, CheckCircle2, AlertCircle, ArrowRight, Printer } from 'lucide-react'
import { AppNav } from '@/components/AppNav'
import { Footer } from '@/components/Footer'
import { Stepper } from '@/components/Stepper'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { submitFeedback } from '@/lib/api'
import { AnalyzeResponse, SkincareProduct } from '@/types/api'
import fallbackProducts from '@/assets/Products.json'

export default function ReportPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const responseData = location.state?.responseData as AnalyzeResponse | undefined

  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  if (!responseData || !responseData.dermaReport) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNav />
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">No Report Found</h2>
          <p className="text-muted-foreground mb-6">Start a new analysis to see your personalized skincare report.</p>
          <Button onClick={() => navigate('/camera')}>Start New Analysis</Button>
        </main>
      </div>
    )
  }

  const { analysis_id, skin_condition, is_emergency, user_data } = responseData
  const report = responseData.dermaReport.report
  
  // Decide which products to show
  let productsToShow: SkincareProduct[] = []
  if (!is_emergency) {
    if (report.products && report.products.length > 0) {
      productsToShow = report.products
    } else {
      // Mapping fallback products to the expected schema
      productsToShow = (fallbackProducts as any[]).slice(0, 4).map(p => ({
        name: p.name || p.productName,
        price: p.price ? parseFloat(p.price) : 25.00,
        description: p.description || p.benefits || "Great for your skin type.",
        keyIngredients: p.ingredients ? (typeof p.ingredients === 'string' ? [p.ingredients] : p.ingredients) : ["Active ingredients"],
        bestFor: p.bestFor || user_data?.skin_type || "All skin types",
        useTime: p.useTime || "Daily"
      }))
    }
  }

  const handleFeedback = async (isAccurate: boolean) => {
    if (!analysis_id) return
    setFeedbackStatus("submitting")
    try {
      await submitFeedback(analysis_id, isAccurate, "")
      setFeedbackStatus("success")
    } catch (e) {
      setFeedbackStatus("error")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 print:py-0 print:px-0">
        <div className="print:hidden">
          <Stepper currentStep={3} />
        </div>

        {/* Emergency Banner */}
        {is_emergency && (
          <div className="mb-8 p-6 bg-destructive/10 border-l-4 border-destructive rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <AlertTriangle className="w-10 h-10 text-destructive shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-destructive">URGENT MEDICAL ALERT</h3>
              <p className="text-destructive/90 font-medium">
                High probability of malignant lesion detected ({skin_condition}). Please stop cosmetic treatments and consult a certified dermatologist immediately.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">Skin Intelligence Report</h1>
            <p className="text-muted-foreground mt-1">
              For {user_data?.name || 'User'} • {user_data?.skin_type} Skin
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={handlePrint} className="hidden sm:flex">
              <Printer className="w-4 h-4 mr-2" /> Print PDF
            </Button>
            <Button onClick={() => navigate('/camera')}>
              New Analysis <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <ScrollArea className="w-full pb-2 print:hidden">
            <TabsList className="w-full justify-start md:w-auto md:inline-flex mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="routine">Routine</TabsTrigger>
              <TabsTrigger value="diet">Diet & Lifestyle</TabsTrigger>
              {!is_emergency && <TabsTrigger value="products">Products</TabsTrigger>}
            </TabsList>
          </ScrollArea>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <Card>
              <CardHeader>
                <CardTitle>AI Diagnosis</CardTitle>
                <CardDescription>Based on our visual analysis model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-lg bg-primary/5 border">
                    <span className="text-sm font-semibold text-primary uppercase tracking-wider">Detected Condition</span>
                    <p className="text-2xl font-bold mt-1">{skin_condition}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dermatologist Notes</span>
                    <p className="text-lg mt-1 text-foreground leading-relaxed">{report.overview.condition}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routine Tab */}
          <TabsContent value="routine" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center text-xl">
                    <span className="text-yellow-500 mr-2 text-2xl">☀</span> Morning Routine
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ol className="space-y-4">
                    {report.routine.morning.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-foreground leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center text-xl">
                    <span className="text-blue-400 mr-2 text-2xl">☾</span> Evening Routine
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ol className="space-y-4">
                    {report.routine.evening.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-foreground leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Diet Tab */}
          <TabsContent value="diet" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Diet & Lifestyle Recommendations</CardTitle>
                <CardDescription>Internal health reflects on your skin</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {report.diet.recommendations.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          {!is_emergency && (
            <TabsContent value="products" className="mt-0">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsToShow.map((product, idx) => (
                  <Card key={idx} className="flex flex-col h-full hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4 border-b">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg leading-tight">{product.name}</CardTitle>
                        <span className="font-semibold text-primary">${product.price?.toFixed(2) || "24.99"}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground mb-4 flex-1">{product.description}</p>
                      
                      <div className="space-y-3 text-sm mt-auto">
                        <div>
                          <span className="font-semibold block mb-1">Key Ingredients:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {product.keyIngredients?.map(ing => (
                              <span key={ing} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs font-medium">
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                          <span>{product.bestFor}</span>
                          <span>{product.useTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Feedback Section */}
        {!is_emergency && (
          <div className="mt-12 py-8 border-t text-center print:hidden">
            <h3 className="text-lg font-bold mb-4">Was this analysis accurate?</h3>
            
            {feedbackStatus === "idle" || feedbackStatus === "error" ? (
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="lg" onClick={() => handleFeedback(true)} className="rounded-full">
                  <ThumbsUp className="w-5 h-5 mr-2 text-primary" /> Yes, accurate
                </Button>
                <Button variant="outline" size="lg" onClick={() => handleFeedback(false)} className="rounded-full">
                  <ThumbsDown className="w-5 h-5 mr-2 text-destructive" /> Needs improvement
                </Button>
              </div>
            ) : feedbackStatus === "submitting" ? (
              <p className="text-muted-foreground animate-pulse">Submitting feedback...</p>
            ) : (
              <p className="text-primary font-medium flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Feedback recorded. Thank you!
              </p>
            )}
            
            {feedbackStatus === "error" && (
              <p className="text-destructive text-sm mt-2">Failed to submit feedback. Please try again.</p>
            )}
          </div>
        )}

      </main>
      
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  )
}
