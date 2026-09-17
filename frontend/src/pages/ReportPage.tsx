import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, ThumbsUp, ThumbsDown, CheckCircle2, AlertCircle, ArrowRight, Printer, Sparkles, Leaf, IndianRupee, ShieldCheck } from 'lucide-react'
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

// Converts USD or base price into Indian Rupees (INR ₹)
const formatToRupees = (price?: number): string => {
  if (!price && price !== 0) return '₹349'
  // If price is under 100, assume it's in USD and convert at standard rate (~83 INR/$)
  const inRupees = price < 100 ? Math.round(price * 83) : Math.round(price)
  return `₹${inRupees.toLocaleString('en-IN')}`
}

// Maps products to low-cost Indian pharmacy alternatives and natural kitchen remedies
interface AlternativeInfo {
  budgetDupe: string
  budgetPrice: string
  kitchenRemedy: string
  kitchenHowTo: string
  estimatedCost: string
}

const getAlternativeForProduct = (productName: string, _skinType: string = 'Normal'): AlternativeInfo => {
  const lower = productName.toLowerCase()
  if (lower.includes('cleanser') || lower.includes('wash')) {
    return {
      budgetDupe: 'Joy pH 5.5 Face Wash / Cipla Saslic DS Foaming Wash',
      budgetPrice: '₹140 - ₹240',
      kitchenRemedy: 'Besan (Gram Flour) + Rose Water / Raw Milk Cleanser',
      kitchenHowTo: 'Mix 1 tsp besan with milk or rose water into a light paste. Massage gently onto damp skin for 60 seconds and rinse.',
      estimatedCost: 'Free / ~₹5 per wash'
    }
  }
  if (lower.includes('moistur') || lower.includes('lotion') || lower.includes('cream') || lower.includes('gel')) {
    return {
      budgetDupe: 'Emolene Cream / Ponds Super Light Hyaluronic Gel',
      budgetPrice: '₹120 - ₹260',
      kitchenRemedy: 'Pure Fresh Aloe Vera Leaf Gel + 2 drops Sweet Almond or Virgin Coconut Oil',
      kitchenHowTo: 'Scrape clear gel from an aloe leaf, blend with 2 drops of pure oil, and pat into damp skin as a protective barrier.',
      estimatedCost: 'Free / ~₹10'
    }
  }
  if (lower.includes('niacinamide') || lower.includes('serum') || lower.includes('blemish') || lower.includes('acid')) {
    return {
      budgetDupe: 'The Derma Co 10% Niacinamide / Minimalist Serum / Sebogel',
      budgetPrice: '₹220 - ₹349',
      kitchenRemedy: 'Cold Fermented Rice Water Toner + Kasturi Turmeric Spot Treatment',
      kitchenHowTo: 'Rinse rice, soak in clean water for 24 hours, and use the fermented water as an antioxidant-rich toner. Dab turmeric on spots.',
      estimatedCost: 'Free (Kitchen DIY)'
    }
  }
  if (lower.includes('sun') || lower.includes('spf')) {
    return {
      budgetDupe: 'Fixderma Shadow SPF 50+ Gel / Joy Revivify Mineral SPF',
      budgetPrice: '₹195 - ₹275',
      kitchenRemedy: 'Physical UV Shielding (Wide-brim hat, umbrella) + Chilled Green Tea mist',
      kitchenHowTo: 'Green tea is rich in EGCG polyphenols that repair photo-damage. Always pair with physical sun coverage when outside.',
      estimatedCost: '~₹15'
    }
  }
  return {
    budgetDupe: 'Indian Generic Pharmacy Dupe (Cipla / Sebamed budget alternative)',
    budgetPrice: '₹150 - ₹280',
    kitchenRemedy: 'Raw Organic Honey Face Pack + Chilled Cucumber slices',
    kitchenHowTo: 'Apply raw honey for 15 minutes as a natural humectant and antibacterial soother. Rinse with cool water.',
    estimatedCost: '~₹10'
  }
}

export default function ReportPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const responseData = location.state?.responseData as AnalyzeResponse | undefined
  const [feedbackStatus, setFeedbackStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [expandedAlternative, setExpandedAlternative] = useState<number | null>(null)

  if (!responseData || !responseData.dermaReport) {
    return (
      <div className="flex min-h-screen flex-col bg-[#1a1814] text-[#f5f0eb]">
        <AppNav />
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <AlertCircle className="w-12 h-12 text-[#e53935] mb-4" />
          <h2 className="text-2xl font-serif font-bold mb-2">No Report Found</h2>
          <p className="text-[#8c827a] mb-6">Start a new analysis to see your personalized skincare report.</p>
          <Button onClick={() => navigate('/camera')} className="rounded-full bg-[#e53935] hover:bg-[#c62828] text-white">
            Start New Analysis
          </Button>
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
    <div className="flex min-h-screen flex-col bg-[#1a1814] text-[#f5f0eb]">
      <AppNav />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8 print:py-0 print:px-0">
        <div className="print:hidden">
          <Stepper currentStep={3} />
        </div>

        {/* Emergency Banner */}
        {is_emergency && (
          <div className="mb-8 p-6 bg-[#e53935]/15 border-l-4 border-[#e53935] rounded-r-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <AlertTriangle className="w-10 h-10 text-[#e53935] shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-[#e53935]">URGENT MEDICAL ALERT</h3>
              <p className="text-[#f5f0eb] font-medium">
                High probability of malignant lesion detected ({skin_condition}). Please stop cosmetic treatments and consult a certified dermatologist immediately.
              </p>
            </div>
          </div>
        )}

        {/* Report Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:mb-4">
          <div>
            <h1 className="text-4xl font-serif font-normal tracking-tight text-[#f5f0eb]">Skin Intelligence Report</h1>
            <p className="text-[#8c827a] font-mono text-sm mt-1">
              For <span className="text-[#f5f0eb] font-medium">{user_data?.name || 'User'}</span> • <span className="text-[#e53935]">{user_data?.skin_type || 'Custom'} Skin</span>
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={handlePrint} className="hidden sm:flex border-[#352f2a] text-[#ede6db] hover:bg-[#25201c]">
              <Printer className="w-4 h-4 mr-2 text-[#e53935]" /> Print PDF
            </Button>
            <Button onClick={() => navigate('/camera')} className="rounded-full bg-[#e53935] hover:bg-[#c62828] text-white">
              New Analysis <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <ScrollArea className="w-full pb-2 print:hidden">
            <TabsList className="w-full justify-start md:w-auto md:inline-flex mb-6 bg-[#25201c] border border-[#352f2a] p-1 rounded-xl">
              <TabsTrigger value="overview" className="data-[state=active]:bg-[#e53935] data-[state=active]:text-white rounded-lg">
                Overview
              </TabsTrigger>
              <TabsTrigger value="routine" className="data-[state=active]:bg-[#e53935] data-[state=active]:text-white rounded-lg">
                Routine
              </TabsTrigger>
              <TabsTrigger value="diet" className="data-[state=active]:bg-[#e53935] data-[state=active]:text-white rounded-lg">
                Diet & Lifestyle
              </TabsTrigger>
              {!is_emergency && (
                <TabsTrigger value="products" className="data-[state=active]:bg-[#e53935] data-[state=active]:text-white rounded-lg">
                  Products (₹)
                </TabsTrigger>
              )}
              {!is_emergency && (
                <TabsTrigger value="remedies" className="data-[state=active]:bg-[#e53935] data-[state=active]:text-white rounded-lg flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5" />
                  Home Remedies & Budget Dupes
                </TabsTrigger>
              )}
            </TabsList>
          </ScrollArea>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            <Card className="bg-[#241f1b]/80 border-[#352f2a] text-[#f5f0eb]">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">AI Clinical Diagnosis</CardTitle>
                <CardDescription className="text-[#8c827a]">Visual intelligence assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="p-5 rounded-xl bg-[#1e1a17] border border-[#e53935]/30 shadow-[0_0_20px_rgba(229,57,53,0.08)]">
                    <span className="text-xs font-mono font-semibold text-[#e53935] uppercase tracking-widest">
                      Detected Condition
                    </span>
                    <p className="text-3xl font-serif font-bold text-[#f5f0eb] mt-1">{skin_condition}</p>
                  </div>
                  <div className="p-5 rounded-xl bg-[#1e1a17] border border-[#352f2a]">
                    <span className="text-xs font-mono font-semibold text-[#8c827a] uppercase tracking-widest">
                      Dermatologist Clinical Notes
                    </span>
                    <p className="text-base mt-2 text-[#ede6db] leading-relaxed font-light">
                      {report.overview.condition}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routine Tab */}
          <TabsContent value="routine" className="mt-0">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#241f1b]/80 border-[#352f2a] text-[#f5f0eb]">
                <CardHeader className="pb-3 border-b border-[#352f2a]">
                  <CardTitle className="flex items-center text-xl font-serif">
                    <span className="text-amber-400 mr-2 text-2xl">☀</span> Morning Regimen
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ol className="space-y-4">
                    {report.routine.morning.map((step, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#e53935]/20 text-[#e53935] text-xs font-mono font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-[#ede6db] leading-relaxed font-light">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              <Card className="bg-[#241f1b]/80 border-[#352f2a] text-[#f5f0eb]">
                <CardHeader className="pb-3 border-b border-[#352f2a]">
                  <CardTitle className="flex items-center text-xl font-serif">
                    <span className="text-indigo-400 mr-2 text-2xl">☾</span> Evening Regimen
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ol className="space-y-4">
                    {report.routine.evening.map((step, idx) => (
                      <li key={idx} className="flex gap-3 items-start">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#e53935]/20 text-[#e53935] text-xs font-mono font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-[#ede6db] leading-relaxed font-light">{step}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Diet Tab */}
          <TabsContent value="diet" className="mt-0">
            <Card className="bg-[#241f1b]/80 border-[#352f2a] text-[#f5f0eb]">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Diet & Nutrition Guidance</CardTitle>
                <CardDescription className="text-[#8c827a]">Internal wellness reflected through dermatological health</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {report.diet.recommendations.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#1e1a17]/50 border border-[#352f2a]/60">
                      <CheckCircle2 className="w-5 h-5 text-[#e53935] mt-0.5 shrink-0" />
                      <span className="text-[#ede6db] leading-relaxed font-light">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          {!is_emergency && (
            <TabsContent value="products" className="mt-0 space-y-6">
              <div className="p-4 rounded-xl bg-[#241f1b]/60 border border-[#352f2a] flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-[#e53935]" />
                  <span className="text-sm text-[#ede6db]">
                    Prices converted to <strong>Indian Rupees (₹ INR)</strong>. Can't afford branded cosmetics?
                  </span>
                </div>
                <span className="text-xs font-mono text-[#e53935] bg-[#e53935]/15 px-3 py-1 rounded-full border border-[#e53935]/30">
                  See Alternatives & DIY below
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsToShow.map((product, idx) => {
                  const alt = getAlternativeForProduct(product.name, user_data?.skin_type)
                  const isExpanded = expandedAlternative === idx

                  return (
                    <Card key={idx} className="flex flex-col h-full bg-[#241f1b]/90 border-[#352f2a] hover:border-[#e53935]/50 transition-all text-[#f5f0eb] shadow-md">
                      <CardHeader className="pb-4 border-b border-[#352f2a]">
                        <div className="flex justify-between items-start gap-3">
                          <CardTitle className="text-lg font-serif leading-snug">{product.name}</CardTitle>
                          <span className="font-mono font-bold text-lg text-[#e53935] whitespace-nowrap">
                            {formatToRupees(product.price)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-sm text-[#ede6db]/80 mb-4 font-light leading-relaxed">{product.description}</p>
                          
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="text-xs font-mono uppercase tracking-wider text-[#8c827a] block mb-1.5">
                                Key Ingredients:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {product.keyIngredients?.map(ing => (
                                  <span key={ing} className="px-2 py-0.5 bg-[#1e1a17] text-[#ede6db] border border-[#352f2a] rounded-md text-xs font-light">
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-between items-center text-xs text-[#8c827a] pt-2 border-t border-[#352f2a]">
                              <span>{product.bestFor}</span>
                              <span className="font-mono text-[#e53935]">{product.useTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* Affordable Alternative Box */}
                        <div className="mt-5 pt-3 border-t border-[#352f2a]/80">
                          <button
                            type="button"
                            onClick={() => setExpandedAlternative(isExpanded ? null : idx)}
                            className="w-full text-left flex items-center justify-between text-xs font-mono text-[#e53935] hover:text-[#f87171] transition-colors py-1"
                          >
                            <span className="flex items-center gap-1.5">
                              <Leaf className="w-3.5 h-3.5" />
                              {isExpanded ? 'Hide Low-Cost Alternative' : '💡 Low-Cost / Home Alternative'}
                            </span>
                            <span>{isExpanded ? '▲' : '▼'}</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 p-3 rounded-lg bg-[#1a1814] border border-[#e53935]/30 text-xs space-y-2.5">
                              <div>
                                <span className="font-semibold text-amber-400 block mb-0.5">
                                  💊 Indian Pharmacy Dupe:
                                </span>
                                <p className="text-[#ede6db]">{alt.budgetDupe} ({alt.budgetPrice})</p>
                              </div>
                              <div>
                                <span className="font-semibold text-emerald-400 block mb-0.5">
                                  🌿 Kitchen DIY Remedy ({alt.estimatedCost}):
                                </span>
                                <p className="text-[#f5f0eb] font-medium">{alt.kitchenRemedy}</p>
                                <p className="text-[#8c827a] mt-1 font-light leading-relaxed">{alt.kitchenHowTo}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          )}

          {/* New Dedicated Tab: Natural Remedies & Budget Dupes */}
          {!is_emergency && (
            <TabsContent value="remedies" className="mt-0 space-y-6">
              <Card className="bg-[#241f1b]/90 border-[#352f2a] text-[#f5f0eb]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-[#e53935]" />
                    <CardTitle className="font-serif text-2xl">Natural Home Remedies & Zero-Cost Care</CardTitle>
                  </div>
                  <CardDescription className="text-[#8c827a]">
                    Clinically safe, kitchen-tested alternatives for individuals who cannot afford costly commercial skincare brands.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Zero-Cost Daily Routine Card */}
                  <div className="p-5 rounded-xl bg-[#1e1a17] border border-[#352f2a]">
                    <h3 className="font-serif text-xl font-bold text-[#f5f0eb] mb-1 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#e53935]" /> Complete 100% Natural Daily Routine
                    </h3>
                    <p className="text-xs text-[#8c827a] font-mono mb-4">Total estimated cost: Under ₹15/day using household ingredients</p>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="p-4 rounded-lg bg-[#241f1b] border border-[#352f2a]/80">
                        <span className="font-mono text-xs text-[#e53935] font-bold block mb-1">STEP 1: CLEANSE</span>
                        <h4 className="font-semibold text-[#f5f0eb] mb-1">Besan (Gram Flour) Cleanser</h4>
                        <p className="text-xs text-[#ede6db]/80 font-light leading-relaxed">
                          Mix 1 tsp gram flour with raw milk (dry skin) or rose water (oily skin). Natural saponins dissolve grime without stripping lipid barriers.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-[#241f1b] border border-[#352f2a]/80">
                        <span className="font-mono text-xs text-[#e53935] font-bold block mb-1">STEP 2: TONE & SOOTHE</span>
                        <h4 className="font-semibold text-[#f5f0eb] mb-1">Chilled Green Tea Mist</h4>
                        <p className="text-xs text-[#ede6db]/80 font-light leading-relaxed">
                          Brew green tea, chill in the fridge, and splash on your face. Rich in polyphenols and EGCG that fight acne bacteria and calm redness.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-[#241f1b] border border-[#352f2a]/80">
                        <span className="font-mono text-xs text-[#e53935] font-bold block mb-1">STEP 3: MOISTURIZE</span>
                        <h4 className="font-semibold text-[#f5f0eb] mb-1">Fresh Aloe Leaf & Almond Oil</h4>
                        <p className="text-xs text-[#ede6db]/80 font-light leading-relaxed">
                          Extract pure aloe vera gel and blend with 1-2 drops of sweet almond or virgin coconut oil. Locks in hydration without clogging pores.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Target Remedies by Skin Issue */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-[#1e1a17] border border-[#352f2a]">
                      <h4 className="font-serif text-lg font-bold text-amber-400 mb-2">
                        For Oily Skin, Acne & Pimples
                      </h4>
                      <ul className="text-xs text-[#ede6db] space-y-2.5 font-light leading-relaxed">
                        <li>
                          <strong className="text-[#f5f0eb]">Multani Mitti (Fuller's Earth) & Neem:</strong> Mix 1 tbsp multani mitti with neem water. Apply for 10 mins 2x a week to absorb sebum (Cost: ~₹20).
                        </li>
                        <li>
                          <strong className="text-[#f5f0eb]">Raw Honey Spot Treatment:</strong> Dab raw unprocessed honey on active acne for 20 mins. Powerful natural antibacterial and anti-scarring agent.
                        </li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-xl bg-[#1e1a17] border border-[#352f2a]">
                      <h4 className="font-serif text-lg font-bold text-indigo-400 mb-2">
                        For Dry Skin, Flaking & Sensitive Skin
                      </h4>
                      <ul className="text-xs text-[#ede6db] space-y-2.5 font-light leading-relaxed">
                        <li>
                          <strong className="text-[#f5f0eb]">Raw Milk & Honey Soak:</strong> Natural lactic acid gently exfoliates dead flakes while raw honey binds moisture into dehydrated skin.
                        </li>
                        <li>
                          <strong className="text-[#f5f0eb]">Oatmeal Paste Mask:</strong> Finely grind regular kitchen oats with lukewarm water. Instantly calms burning, itching, and redness.
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Indian Pharmacy Dupes (Under ₹250) */}
                  <div className="p-5 rounded-xl bg-[#1e1a17] border border-[#352f2a]">
                    <h3 className="font-serif text-xl font-bold text-[#f5f0eb] mb-1 flex items-center gap-2">
                      <IndianRupee className="w-5 h-5 text-[#e53935]" /> Top Budget Indian Pharmacy Dupes (Under ₹250)
                    </h3>
                    <p className="text-xs text-[#8c827a] font-mono mb-4">Available over the counter at any local medical store or Jan Aushadhi Kendra</p>

                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-[#241f1b] border border-[#352f2a]">
                        <span className="font-mono text-[#e53935] font-bold block">Joy pH 5.5 Face Wash</span>
                        <span className="text-[#8c827a] block mt-0.5">Price: ₹149</span>
                        <p className="text-[#ede6db]/70 mt-1">Dupe for ₹1,500 CeraVe Cleanser</p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#241f1b] border border-[#352f2a]">
                        <span className="font-mono text-[#e53935] font-bold block">Emolene Cream</span>
                        <span className="text-[#8c827a] block mt-0.5">Price: ₹240</span>
                        <p className="text-[#ede6db]/70 mt-1">Dupe for ₹2,000 Clinique Moisture Surge</p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#241f1b] border border-[#352f2a]">
                        <span className="font-mono text-[#e53935] font-bold block">Sebogel Salicylic Acid</span>
                        <span className="text-[#8c827a] block mt-0.5">Price: ₹220</span>
                        <p className="text-[#ede6db]/70 mt-1">Dupe for ₹1,200 Paula's Choice BHA</p>
                      </div>

                      <div className="p-3 rounded-lg bg-[#241f1b] border border-[#352f2a]">
                        <span className="font-mono text-[#e53935] font-bold block">Fixderma Shadow SPF 50</span>
                        <span className="text-[#8c827a] block mt-0.5">Price: ₹240</span>
                        <p className="text-[#ede6db]/70 mt-1">Dupe for ₹1,800 La Roche-Posay Anthelios</p>
                      </div>
                    </div>
                  </div>

                  {/* Safety Warning */}
                  <div className="p-3 rounded-lg bg-[#241f1b] border border-[#e53935]/20 flex items-center gap-3 text-xs text-[#8c827a]">
                    <ShieldCheck className="w-5 h-5 text-[#e53935] shrink-0" />
                    <span>
                      <strong className="text-[#f5f0eb]">Safety Rule:</strong> Always patch-test DIY remedies behind your ear or on your inner forearm for 24 hours. Never apply raw undiluted lemon juice, baking soda, or toothpaste to facial skin.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Feedback Section */}
        {!is_emergency && (
          <div className="mt-12 py-8 border-t border-[#352f2a] text-center print:hidden">
            <h3 className="text-lg font-serif font-bold text-[#f5f0eb] mb-4">Was this analysis accurate?</h3>
            
            {feedbackStatus === "idle" || feedbackStatus === "error" ? (
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => handleFeedback(true)} 
                  className="rounded-full border-[#352f2a] text-[#ede6db] hover:bg-[#25201c] hover:border-[#e53935]"
                >
                  <ThumbsUp className="w-5 h-5 mr-2 text-[#e53935]" /> Yes, accurate
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => handleFeedback(false)} 
                  className="rounded-full border-[#352f2a] text-[#ede6db] hover:bg-[#25201c] hover:border-[#e53935]"
                >
                  <ThumbsDown className="w-5 h-5 mr-2 text-[#8c827a]" /> Needs improvement
                </Button>
              </div>
            ) : feedbackStatus === "submitting" ? (
              <p className="text-[#8c827a] font-mono animate-pulse">Submitting feedback...</p>
            ) : (
              <p className="text-[#e53935] font-medium flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Feedback recorded. Thank you!
              </p>
            )}
            
            {feedbackStatus === "error" && (
              <p className="text-[#e53935] text-sm mt-2">Failed to submit feedback. Please try again.</p>
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
