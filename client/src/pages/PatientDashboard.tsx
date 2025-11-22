import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Brain, LogOut, Gamepad2 } from 'lucide-react'

export default function PatientDashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: gamesData } = useQuery({
    queryKey: ['assigned-games'],
    queryFn: async () => {
      const response = await api.get('/patient/games')
      return response.data
    },
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NeuroCare AI</h1>
                <p className="text-sm text-gray-500">Patient Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Games</CardTitle>
            <CardDescription>
              Complete these cognitive games as assigned by your doctor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!gamesData?.games || gamesData.games.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No games assigned yet. Please contact your doctor.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gamesData.games.map((game: any) => (
                  <div
                    key={game.id}
                    className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Gamepad2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {game.game_name.replace(/_/g, ' ').toUpperCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">{game.status}</p>
                      </div>
                    </div>
                    <Button className="w-full" size="sm">
                      Play Game
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
