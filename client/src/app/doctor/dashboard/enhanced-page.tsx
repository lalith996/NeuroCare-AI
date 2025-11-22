'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { doctorAPI, progressAPI } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  Activity,
  TrendingUp,
  AlertCircle,
  Eye,
  Search,
  Filter,
  Download,
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function EnhancedDoctorDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Get patients
  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await doctorAPI.getPatients()
      return response.data
    },
    enabled: isAuthenticated && user?.role === 'doctor',
  })

  // Get comparative analytics
  const { data: analytics } = useQuery({
    queryKey: ['comparative-analytics'],
    queryFn: async () => {
      const response = await progressAPI.getComparativeAnalytics()
      return response.data
    },
    enabled: isAuthenticated && user?.role === 'doctor',
  })

  // Filter and sort patients
  const filteredPatients = patients?.filter((patient: any) => {
    // Search filter
    const matchesSearch =
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientCode?.toString().includes(searchQuery) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase())

    // Risk filter
    const matchesRisk =
      riskFilter === 'all' ||
      patient.riskLevel?.toLowerCase().includes(riskFilter.toLowerCase())

    return matchesSearch && matchesRisk
  })

  const sortedPatients = filteredPatients?.sort((a: any, b: any) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'risk':
        const riskOrder = { high: 0, medium: 1, low: 2, unknown: 3 }
        return (
          (riskOrder[a.riskLevel?.toLowerCase() as keyof typeof riskOrder] || 3) -
          (riskOrder[b.riskLevel?.toLowerCase() as keyof typeof riskOrder] || 3)
        )
      case 'progress':
        return (b.completedGames || 0) - (a.completedGames || 0)
      default:
        return 0
    }
  })

  const stats = {
    totalPatients: patients?.length || 0,
    activeAssessments:
      patients?.filter((p: any) => p.totalGames && p.totalGames > 0).length || 0,
    highRisk: patients?.filter((p: any) => p.riskLevel?.toLowerCase().includes('high')).length || 0,
    avgScore: analytics?.patients
      ? (
          analytics.patients.reduce((sum: number, p: any) => sum + (p.average_score || 0), 0) /
          analytics.patients.length
        ).toFixed(1)
      : '0',
  }

  const exportData = () => {
    const csvData = sortedPatients
      ?.map((p: any) => `${p.name},${p.patientCode},${p.email},${p.riskLevel || 'Unknown'}`)
      .join('\n')

    const blob = new Blob([`Name,Code,Email,Risk\n${csvData}`], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patients-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage patients and view comprehensive analytics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Patients"
            value={stats.totalPatients}
            icon={<Users className="w-6 h-6" />}
            color="bg-blue-500"
          />
          <StatsCard
            title="Active Assessments"
            value={stats.activeAssessments}
            icon={<Activity className="w-6 h-6" />}
            color="bg-green-500"
          />
          <StatsCard
            title="High Risk"
            value={stats.highRisk}
            icon={<AlertCircle className="w-6 h-6" />}
            color="bg-red-500"
          />
          <StatsCard
            title="Avg Score"
            value={stats.avgScore}
            icon={<TrendingUp className="w-6 h-6" />}
            color="bg-purple-500"
          />
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, code, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="risk">Risk Level</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>

              <Button onClick={() => router.push('/doctor/analytics')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Patients ({sortedPatients?.length || 0})
            </CardTitle>
            <CardDescription>
              {searchQuery || riskFilter !== 'all'
                ? 'Filtered results'
                : 'All your assigned patients'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading patients...</div>
            ) : sortedPatients && sortedPatients.length > 0 ? (
              <div className="space-y-3">
                {sortedPatients.map((patient: any) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    onView={() => router.push(`/doctor/patients/${patient.patientCode}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery || riskFilter !== 'all'
                  ? 'No patients match your filters'
                  : 'No patients assigned yet'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatsCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color} text-white`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function PatientCard({ patient, onView }: { patient: any; onView: () => void }) {
  const getRiskBadge = (risk?: string) => {
    if (!risk) return <Badge>Unknown</Badge>
    const riskLower = risk.toLowerCase()
    if (riskLower.includes('high'))
      return <Badge variant="destructive">High Risk</Badge>
    if (riskLower.includes('medium'))
      return <Badge className="bg-yellow-500">Medium Risk</Badge>
    return <Badge className="bg-green-500">Low Risk</Badge>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">{patient.name?.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold">{patient.name}</h3>
            <p className="text-sm text-muted-foreground">
              Code: {patient.patientCode} • {patient.email}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right mr-4">
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="font-semibold">
            {patient.completedGames || 0}/{patient.totalGames || 0} games
          </p>
        </div>
        {getRiskBadge(patient.riskLevel)}
        <Button variant="outline" size="sm" onClick={onView}>
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      </div>
    </motion.div>
  )
}
