'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { doctorAPI } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Activity, TrendingUp, AlertCircle, Eye, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Patient } from '@/types'

export default function DoctorDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'doctor') {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, router])

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await doctorAPI.getPatients()
      return response.data
    },
    enabled: isAuthenticated && user?.role === 'doctor',
  })

  const stats = {
    totalPatients: patients?.length || 0,
    activeAssessments: patients?.filter((p: Patient) => p.totalGames && p.totalGames > 0).length || 0,
    highRisk: patients?.filter((p: Patient) => p.riskLevel?.toLowerCase().includes('high')).length || 0,
    completedToday: 0,
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Manage patients and view assessment results</p>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              icon={<Users className="w-6 h-6" />}
              color="bg-blue-500"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Active Assessments"
              value={stats.activeAssessments}
              icon={<Activity className="w-6 h-6" />}
              color="bg-green-500"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="High Risk"
              value={stats.highRisk}
              icon={<AlertCircle className="w-6 h-6" />}
              color="bg-red-500"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Completed Today"
              value={stats.completedToday}
              icon={<TrendingUp className="w-6 h-6" />}
              color="bg-purple-500"
            />
          </motion.div>
        </motion.div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patients</CardTitle>
                <CardDescription>View and manage your assigned patients</CardDescription>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading patients...</div>
            ) : patients && patients.length > 0 ? (
              <div className="space-y-4">
                {patients.map((patient: Patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    onView={() => router.push(`/doctor/patients/${patient.patientCode}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No patients assigned yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
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

function PatientCard({
  patient,
  onView,
}: {
  patient: Patient
  onView: () => void
}) {
  const getRiskBadge = (risk?: string) => {
    if (!risk) return <Badge>Unknown</Badge>
    const riskLower = risk.toLowerCase()
    if (riskLower.includes('high')) return <Badge variant="destructive">High Risk</Badge>
    if (riskLower.includes('medium')) return <Badge variant="secondary">Medium Risk</Badge>
    return <Badge>Low Risk</Badge>
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">
              {patient.name.charAt(0)}
            </span>
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
    </div>
  )
}
