import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { User } from 'lucide-react'

interface Patient {
  id: number
  patient_code: number
  age?: number
  sex?: string
  education_years?: number
  email?: string
  full_name?: string
}

interface PatientListProps {
  patients: Patient[]
  onSelectPatient: (patientCode: number) => void
  selectedPatient: number | null
}

export default function PatientList({ patients, onSelectPatient, selectedPatient }: PatientListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Patients</CardTitle>
        <CardDescription>Select a patient to view details and manage their care</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {patients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No patients assigned yet</p>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.id}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPatient === patient.patient_code
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-accent'
                }`}
                onClick={() => onSelectPatient(patient.patient_code)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Patient #{patient.patient_code}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.age ? `${patient.age}y` : 'N/A'} • {patient.sex || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={selectedPatient === patient.patient_code ? 'default' : 'outline'}
                    size="sm"
                  >
                    View
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
