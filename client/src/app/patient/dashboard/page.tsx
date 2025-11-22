'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { patientAPI } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Trophy, Clock, CheckCircle, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { Game } from '@/types'

export default function PatientDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'patient') {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, router])

  const { data: games, isLoading } = useQuery({
    queryKey: ['assigned-games'],
    queryFn: async () => {
      const response = await patientAPI.getAssignedGames()
      return response.data
    },
    enabled: isAuthenticated && user?.role === 'patient',
  })

  const completedGames = games?.filter((g: any) => g.completed).length || 0
  const totalGames = games?.length || 0

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
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Complete your assigned cognitive assessments</p>
        </div>

        {/* Progress Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Games</p>
                    <p className="text-3xl font-bold">{totalGames}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-500 text-white">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Completed</p>
                    <p className="text-3xl font-bold">{completedGames}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-500 text-white">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Progress</p>
                    <p className="text-3xl font-bold">
                      {totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0}%
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-500 text-white">
                    <Trophy className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Assigned Games */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Games</CardTitle>
            <CardDescription>Complete these cognitive assessments as assigned by your doctor</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading games...</div>
            ) : games && games.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game: any, index: number) => (
                  <GameCard
                    key={index}
                    game={game}
                    onPlay={() => router.push(`/patient/games/${game.gameId}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No games assigned yet. Please contact your doctor.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function GameCard({
  game,
  onPlay,
}: {
  game: any
  onPlay: () => void
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            {game.completed ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge variant="secondary">Pending</Badge>
            )}
          </div>
          <CardTitle className="text-lg">{game.gameName}</CardTitle>
          <CardDescription className="line-clamp-2">
            {game.description || 'Cognitive assessment game'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {game.completed ? (
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Trophy className="w-4 h-4 mr-2" />
                Score: {game.score || 'N/A'}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                Completed: {new Date(game.completedAt).toLocaleDateString()}
              </div>
              <Button variant="outline" className="w-full mt-2" onClick={onPlay}>
                View Details
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={onPlay}>
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
