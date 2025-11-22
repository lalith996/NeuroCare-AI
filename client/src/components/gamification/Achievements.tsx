'use client'

import { useQuery } from '@tanstack/react-query'
import { gamificationAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Flame, Target, TrendingUp, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

interface Achievement {
  id: number
  code: string
  name: string
  description: string
  category: string
  icon: string
  points: number
  is_earned: boolean
  earned_at: string | null
  progress: number
}

export function Achievements() {
  const { data, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const response = await gamificationAPI.getAchievements()
      return response.data
    },
  })

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      const response = await gamificationAPI.getStreak()
      return response.data
    },
  })

  if (isLoading) {
    return <div>Loading achievements...</div>
  }

  const achievements: Achievement[] = data?.achievements || []
  const earnedCount = data?.totalEarned || 0
  const totalPoints = data?.totalPoints || 0

  const categories = {
    games: { label: 'Games', icon: Target, color: 'text-blue-500' },
    consistency: { label: 'Consistency', icon: Flame, color: 'text-orange-500' },
    improvement: { label: 'Improvement', icon: TrendingUp, color: 'text-green-500' },
    milestones: { label: 'Milestones', icon: Trophy, color: 'text-yellow-500' },
  }

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const Icon = achievement.is_earned ? Trophy : Lock

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={achievement.is_earned ? 'border-primary' : 'opacity-60'}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{achievement.name}</h3>
                  {achievement.is_earned && (
                    <Badge variant="default" className="ml-2">
                      Earned
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{achievement.points} points</span>
                  {achievement.earned_at && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnedCount}</div>
            <p className="text-xs text-muted-foreground">
              of {achievements.length} unlocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPoints}</div>
            <p className="text-xs text-muted-foreground">points earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streakData?.current_streak || 0}</div>
            <p className="text-xs text-muted-foreground">
              days ({streakData?.longest_streak || 0} longest)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements by Category */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="improvement">Improvement</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {achievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </TabsContent>

        {Object.entries(categories).map(([category, config]) => (
          <TabsContent key={category} value={category} className="space-y-4 mt-6">
            {achievements
              .filter((a) => a.category === category)
              .map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
