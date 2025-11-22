'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useQuery } from '@tanstack/react-query'
import { gamificationAPI, progressAPI } from '@/lib/api'
import { Navbar } from '@/components/layout/Navbar'
import { Achievements } from '@/components/gamification/Achievements'
import { ProgressChart } from '@/components/progress/ProgressChart'
import { MemoryMatchGame } from '@/components/games/MemoryMatchGame'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Brain,
  Activity,
  Award,
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function EnhancedPatientDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  // Get achievements
  const { data: achievementsData } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const response = await gamificationAPI.getAchievements()
      return response.data
    },
    enabled: isAuthenticated && user?.role === 'patient',
  })

  // Get streak
  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const response = await gamificationAPI.getStreak()
      return response.data
    },
    enabled: isAuthenticated && user?.role === 'patient',
  })

  // Get leaderboard
  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await gamificationAPI.getLeaderboard()
      return response.data
    },
    enabled: isAuthenticated && user?.role === 'patient',
  })

  const stats = {
    achievements: achievementsData?.totalEarned || 0,
    totalPoints: achievementsData?.totalPoints || 0,
    currentStreak: streakData?.current_streak || 0,
    longestStreak: streakData?.longest_streak || 0,
    totalGames: streakData?.total_games_played || 0,
    leaderboardRank:
      leaderboardData?.leaderboard?.findIndex((p: any) => p.id === user?.id) + 1 || 0,
  }

  const availableGames = [
    {
      id: 'memory-match',
      name: 'Memory Match',
      description: 'Test your memory by matching pairs of cards',
      icon: Brain,
      color: 'bg-blue-500',
    },
    {
      id: 'pattern-recognition',
      name: 'Pattern Recognition',
      description: 'Identify patterns in sequences (Coming Soon)',
      icon: Target,
      color: 'bg-purple-500',
      disabled: true,
    },
    {
      id: 'attention-test',
      name: 'Attention Test',
      description: 'Test your focus and attention span (Coming Soon)',
      icon: Activity,
      color: 'bg-green-500',
      disabled: true,
    },
  ]

  if (!isAuthenticated || user?.role !== 'patient') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/30">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Track your progress and unlock achievements
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <QuickStat
            icon={<Trophy className="w-5 h-5" />}
            label="Achievements"
            value={stats.achievements}
            color="text-yellow-500"
          />
          <QuickStat
            icon={<Award className="w-5 h-5" />}
            label="Points"
            value={stats.totalPoints}
            color="text-purple-500"
          />
          <QuickStat
            icon={<Flame className="w-5 h-5" />}
            label="Current Streak"
            value={`${stats.currentStreak}d`}
            color="text-orange-500"
          />
          <QuickStat
            icon={<TrendingUp className="w-5 h-5" />}
            label="Longest Streak"
            value={`${stats.longestStreak}d`}
            color="text-green-500"
          />
          <QuickStat
            icon={<Brain className="w-5 h-5" />}
            label="Games Played"
            value={stats.totalGames}
            color="text-blue-500"
          />
          <QuickStat
            icon={<Target className="w-5 h-5" />}
            label="Rank"
            value={stats.leaderboardRank > 0 ? `#${stats.leaderboardRank}` : 'N/A'}
            color="text-pink-500"
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            {selectedGame === 'memory-match' ? (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedGame(null)}
                >
                  ← Back to Games
                </Button>
                <MemoryMatchGame />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPlay={() => setSelectedGame(game.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <ProgressChart patientCode={user?.patientCode || user?.id?.toString() || '0'} days={30} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Achievements />
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Leaderboard</CardTitle>
                <CardDescription>Top players by total points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboardData?.leaderboard?.slice(0, 10).map((player: any, index: number) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.id === user?.id ? 'bg-primary/10 border border-primary' : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? 'bg-yellow-500 text-white'
                              : index === 1
                              ? 'bg-gray-300 text-gray-700'
                              : index === 2
                              ? 'bg-orange-400 text-white'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {player.full_name}
                            {player.id === user?.id && (
                              <Badge className="ml-2" variant="outline">
                                You
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {player.achievements_earned} achievements
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{player.total_points}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className={`mb-2 ${color}`}>{icon}</div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function GameCard({
  game,
  onPlay,
}: {
  game: {
    id: string
    name: string
    description: string
    icon: any
    color: string
    disabled?: boolean
  }
  onPlay: () => void
}) {
  const Icon = game.icon

  return (
    <motion.div
      whileHover={{ scale: game.disabled ? 1 : 1.02 }}
      whileTap={{ scale: game.disabled ? 1 : 0.98 }}
    >
      <Card className={game.disabled ? 'opacity-50' : 'cursor-pointer hover:border-primary'}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`p-4 rounded-full ${game.color} text-white`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{game.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{game.description}</p>
            </div>
            <Button
              className="w-full"
              onClick={onPlay}
              disabled={game.disabled}
            >
              {game.disabled ? 'Coming Soon' : 'Play Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
