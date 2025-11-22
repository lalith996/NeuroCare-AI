import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  signup: (data: { email: string; password: string; name: string; role: string }) =>
    api.post('/api/auth/signup', data),

  getMe: () => api.get('/api/auth/me'),

  logout: () => {
    localStorage.removeItem('token')
    window.location.href = '/auth/login'
  },
}

// Doctor API
export const doctorAPI = {
  getPatients: () => api.get('/api/doctor/patients'),

  getPatientScores: (patientCode: string) =>
    api.get(`/api/doctor/patients/${patientCode}/scores`),

  assignGames: (patientCode: string, gameIds: number[]) =>
    api.post('/api/doctor/assign-games', { patientCode, gameIds }),

  getPatientDetails: (patientCode: string) =>
    api.get(`/api/doctor/patients/${patientCode}`),
}

// Patient API
export const patientAPI = {
  getAssignedGames: () => api.get('/api/patient/games'),

  uploadDocument: (formData: FormData) =>
    api.post('/api/patient/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getDocuments: () => api.get('/api/patient/documents'),

  getProfile: () => api.get('/api/patient/profile'),
}

// Scores API
export const scoresAPI = {
  submitScore: (data: {
    gameId: number
    score: number
    timeTaken: number
    metadata?: any
  }) => api.post('/api/scores', data),

  getMyScores: () => api.get('/api/scores/my-scores'),
}

// Predictions API
export const predictionsAPI = {
  runPrediction: (patientCode: string) =>
    api.post('/api/predictions', { patientCode }),

  getPrediction: (patientCode: string) =>
    api.get(`/api/predictions/${patientCode}`),
}

// Reports API
export const reportsAPI = {
  generateReport: (patientCode: string) =>
    api.post(`/api/reports/generate/${patientCode}`),

  getLatestReport: (patientCode: string) =>
    api.get(`/api/reports/patient/${patientCode}/latest`),

  getAllReports: (patientCode: string) =>
    api.get(`/api/reports/patient/${patientCode}`),
}

// Games API
export const gamesAPI = {
  getAllGames: () => api.get('/api/games'),

  getGame: (gameId: number) => api.get(`/api/games/${gameId}`),
}
