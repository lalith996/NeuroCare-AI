'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, ArrowLeft, Shield, Activity, Users, Zap, Heart, Award } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary/10 rounded-full">
                <Brain className="w-16 h-16 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              About NeuroCare AI
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Revolutionizing cognitive assessment through AI-powered technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="HIPAA Compliant"
              description="Enterprise-grade security with end-to-end encryption for patient data protection"
            />
            <FeatureCard
              icon={<Activity className="w-8 h-8" />}
              title="AI-Powered"
              description="Advanced machine learning algorithms for accurate cognitive assessments"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Collaborative"
              description="Seamless doctor-patient collaboration and communication platform"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Fast & Efficient"
              description="Quick assessments with instant results and detailed analytics"
            />
          </div>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-4">
              <p>
                NeuroCare AI is dedicated to early detection and assessment of cognitive decline,
                particularly focusing on Alzheimer's disease and Mild Cognitive Impairment (MCI).
              </p>
              <p>
                Through gamified cognitive assessments and advanced AI analysis, we empower
                healthcare providers with the tools they need to make informed decisions about
                patient care.
              </p>
              <p>
                Our platform bridges the gap between patients and doctors, making cognitive
                health monitoring accessible, engaging, and effective.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Why Choose NeuroCare?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Evidence-Based</h3>
                  <p className="text-muted-foreground">
                    Our assessments are based on clinically validated cognitive tests
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI-Enhanced</h3>
                  <p className="text-muted-foreground">
                    Machine learning models provide accurate risk predictions
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Patient-Centered</h3>
                  <p className="text-muted-foreground">
                    Engaging, gamified experience that patients actually enjoy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="text-primary mb-4">{icon}</div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
