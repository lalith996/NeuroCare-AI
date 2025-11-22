'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
} from 'lucide-react'
import { motion } from 'framer-motion'

export function ComparativeAnalytics() {
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('risk')

  // Fetch comparative data
  const { data, isLoading } = useQuery({
    queryKey: ['comparative-analytics', riskFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (riskFilter !== 'all') params.append('riskLevel', riskFilter)
      params.append('sortBy', sortBy)

      const response = await fetch(`/api/analytics/comparative?${params}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to fetch analytics')
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparative Patient Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const patients = data?.patients || []

  // Filter patients by search term
  const filteredPatients = patients.filter((patient: any) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate summary statistics
  const summary = {
    total: patients.length,
    highRisk: patients.filter((p: any) => p.risk_level === 'High').length,
    mediumRisk: patients.filter((p: any) => p.risk_level === 'Medium').length,
    lowRisk: patients.filter((p: any) => p.risk_level === 'Low').length,
    avgScore: Math.round(
      patients.reduce((sum: number, p: any) => sum + (p.avg_score || 0), 0) / patients.length || 0
    ),
    activePatients: patients.filter((p: any) => p.days_since_last_activity <= 7).length,
  }

  // Prepare data for charts
  const riskDistribution = [
    { name: 'High Risk', value: summary.highRisk, color: '#ef4444' },
    { name: 'Medium Risk', value: summary.mediumRisk, color: '#f59e0b' },
    { name: 'Low Risk', value: summary.lowRisk, color: '#10b981' },
  ]

  const performanceData = patients.map((p: any) => ({
    name: p.name,
    score: p.avg_score || 0,
    engagement: p.total_games || 0,
    risk: p.risk_score || 0,
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-3xl font-bold">{summary.total}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                  <p className="text-3xl font-bold text-red-600">{summary.highRisk}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Patients</p>
                  <p className="text-3xl font-bold text-green-600">{summary.activePatients}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Performance</p>
                  <p className="text-3xl font-bold">{summary.avgScore}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Across all patients</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="patients">Patient List</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Patient risk level breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance vs Engagement</CardTitle>
                <CardDescription>Patient score correlation with game activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="engagement" name="Games Played" />
                    <YAxis type="number" dataKey="score" name="Avg Score" domain={[0, 100]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Patients" data={performanceData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Detailed risk assessment for all patients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* High Risk Patients */}
                {summary.highRisk > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <h4 className="font-semibold text-red-900 dark:text-red-100">
                        High Risk Patients ({summary.highRisk})
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {patients
                        .filter((p: any) => p.risk_level === 'High')
                        .map((patient: any) => (
                          <div
                            key={patient.patient_code}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Code: {patient.patient_code}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-600">
                                {patient.risk_score}
                              </p>
                              <p className="text-xs text-muted-foreground">Risk Score</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Medium Risk Patients */}
                {summary.mediumRisk > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                        Medium Risk Patients ({summary.mediumRisk})
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {patients
                        .filter((p: any) => p.risk_level === 'Medium')
                        .slice(0, 6)
                        .map((patient: any) => (
                          <div
                            key={patient.patient_code}
                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded"
                          >
                            <p className="text-sm font-medium">{patient.name}</p>
                            <p className="text-sm font-bold text-yellow-600">
                              {patient.risk_score}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient List Tab */}
        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle>Patient Management</CardTitle>
              <CardDescription>Search, filter, and view all patients</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by risk" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    <SelectItem value="High">High Risk</SelectItem>
                    <SelectItem value="Medium">Medium Risk</SelectItem>
                    <SelectItem value="Low">Low Risk</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="risk">Risk Score</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Table */}
              <div className="space-y-2">
                {filteredPatients.map((patient: any) => (
                  <div
                    key={patient.patient_code}
                    className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">{patient.name}</h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              patient.risk_level === 'High'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                : patient.risk_level === 'Medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}
                          >
                            {patient.risk_level} Risk
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Code: {patient.patient_code} • {patient.total_games || 0} games played
                        </p>
                      </div>
                      <div className="flex items-center gap-6 text-center">
                        <div>
                          <p className="text-2xl font-bold">{patient.avg_score || 0}</p>
                          <p className="text-xs text-muted-foreground">Avg Score</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">{patient.risk_score || 0}</p>
                          <p className="text-xs text-muted-foreground">Risk Score</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No patients found matching your criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
