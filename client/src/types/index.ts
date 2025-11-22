export interface User {
  id: number
  email: string
  name: string
  role: 'doctor' | 'patient'
  patientCode?: string
  createdAt: string
}

export interface Patient {
  id: number
  patientCode: string
  name: string
  email: string
  age?: number
  gender?: string
  assignedBy?: number
  doctorName?: string
  createdAt: string
  lastAssessment?: string
  riskLevel?: string
  totalGames?: number
  completedGames?: number
}

export interface Game {
  id: number
  name: string
  description: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: number
  icon?: string
  isActive: boolean
}

export interface Score {
  id: number
  gameId: number
  gameName: string
  score: number
  maxScore: number
  timeTaken: number
  completedAt: string
  metadata?: Record<string, any>
}

export interface Prediction {
  id: number
  patientCode: string
  riskLevel: string
  confidence: number
  factors: string[]
  createdAt: string
  modelVersion: string
}

export interface Report {
  id: number
  patientCode: string
  patientName: string
  generatedBy: number
  doctorName: string
  summary: string
  scores: Score[]
  prediction?: Prediction
  recommendations: string[]
  createdAt: string
}

export interface Document {
  id: number
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt: string
  url: string
}

export interface DashboardStats {
  totalPatients?: number
  activeAssessments?: number
  completedToday?: number
  averageScore?: number
  highRiskPatients?: number
  totalGames?: number
  completedGames?: number
  averageAccuracy?: number
}

export interface ChartData {
  name: string
  value: number
  label?: string
}

export interface GameAssignment {
  gameId: number
  gameName: string
  assignedAt: string
  completed: boolean
  score?: number
  completedAt?: string
}
