'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { doctorAPI } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, User, Mail, Calendar, Activity } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function PatientDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const patientCode = params.code as string

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, router])

  const { data: scores, isLoading } = useQuery({
    queryKey: ['patient-scores', patientCode],
    queryFn: async () => {
      const response = await doctorAPI.getPatientScores(patientCode)
      return response.data
    },
    enabled: isAuthenticated && !!patientCode,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/doctor/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Patient Details</h1>
          <p className="text-muted-foreground">Patient Code: {patientCode}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Patient</p>
                  <p className="text-sm text-muted-foreground">{patientCode}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Email on file</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Registered: {formatDate(new Date())}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Assessments: {scores?.length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scores and Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
              <CardDescription>View patient performance and scores</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scores">
                <TabsList>
                  <TabsTrigger value="scores">Scores</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="scores" className="space-y-4 mt-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading scores...</div>
                  ) : scores && scores.length > 0 ? (
                    <div className="space-y-3">
                      {scores.map((score: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <p className="font-semibold">{score.gameName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(score.completedAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="default">
                              Score: {score.score}/{score.maxScore || 100}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Time: {score.timeTaken}s
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No scores available yet
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="analytics" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Analytics visualization coming soon
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    Reports feature coming soon
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
