import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { useToast } from '../ui/use-toast'
import { Gamepad2, FileText, Activity } from 'lucide-react'
import GameAssignment from './GameAssignment'
import ScoresView from './ScoresView'

interface PatientDetailsProps {
  patientCode: number
}

export default function PatientDetails({ patientCode }: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState<'games' | 'scores' | 'report'>('games')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: scoresData } = useQuery({
    queryKey: ['patient-scores', patientCode],
    queryFn: async () => {
      const response = await api.get(`/doctor/patients/${patientCode}/scores`)
      return response.data
    },
  })

  const generateReportMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/reports/generate/${patientCode}`)
      return response.data
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Report generated successfully' })
      queryClient.invalidateQueries({ queryKey: ['patient-report', patientCode] })
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to generate report', variant: 'destructive' })
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient #{patientCode}</CardTitle>
        <CardDescription>Manage games, view scores, and generate reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-6">
          <Button
            variant={activeTab === 'games' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('games')}
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Assign Games
          </Button>
          <Button
            variant={activeTab === 'scores' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('scores')}
          >
            <Activity className="h-4 w-4 mr-2" />
            View Scores
          </Button>
          <Button
            variant={activeTab === 'report' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('report')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Report
          </Button>
        </div>

        {activeTab === 'games' && <GameAssignment patientCode={patientCode} />}
        {activeTab === 'scores' && <ScoresView scores={scoresData?.scores || []} prediction={scoresData?.prediction} />}
        {activeTab === 'report' && (
          <div className="space-y-4">
            <Button onClick={() => generateReportMutation.mutate()} disabled={generateReportMutation.isPending}>
              {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
