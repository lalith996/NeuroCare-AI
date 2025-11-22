'use client'

import { useQuery } from '@tanstack/react-query'
import { progressAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface ProgressChartProps {
  patientCode: string
  days?: number
}

export function ProgressChart({ patientCode, days = 30 }: ProgressChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['patient-progress', patientCode, days],
    queryFn: async () => {
      const response = await progressAPI.getPatientProgress(patientCode, days)
      return response.data
    },
  })

  if (isLoading) {
    return <div>Loading progress data...</div>
  }

  const scoreHistory = data?.scoreHistory || []
  const statistics = data?.statistics || {}
  const trend = data?.trend || {}
  const gameBreakdown = data?.gameBreakdown || []

  // Process data for charts
  const dailyScores = scoreHistory.reduce((acc: any[], score: any) => {
    const existingDay = acc.find((d) => d.date === score.date)
    if (existingDay) {
      existingDay[score.game] = parseFloat(score.avg_score)
    } else {
      acc.push({
        date: new Date(score.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        [score.game]: parseFloat(score.avg_score),
      })
    }
    return acc
  }, [])

  const isImproving = trend.improvement > 0

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.overall_avg_score?.toFixed(1) || 0}
            </div>
            <p className="text-xs text-muted-foreground">out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_games || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.unique_games || 0} unique games
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Score</CardTitle>
            {isImproving ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.best_score?.toFixed(1) || 0}
            </div>
            <p className="text-xs text-muted-foreground">personal best</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            {isImproving ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${isImproving ? 'text-green-500' : 'text-red-500'}`}
            >
              {trend.improvement ? `${trend.improvement > 0 ? '+' : ''}${trend.improvement.toFixed(1)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">vs last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="games">By Game</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score Progress Over Time</CardTitle>
              <CardDescription>Average scores by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {Array.from(new Set(scoreHistory.map((s: any) => s.game))).map(
                    (game, index) => (
                      <Line
                        key={game as string}
                        type="monotone"
                        dataKey={game as string}
                        stroke={`hsl(${(index * 360) / 5}, 70%, 50%)`}
                        strokeWidth={2}
                      />
                    )
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Game</CardTitle>
              <CardDescription>Average scores for each game type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={gameBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="game" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avg_score" fill="hsl(var(--primary))" name="Average Score" />
                  <Bar dataKey="best_score" fill="hsl(var(--secondary))" name="Best Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Game Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Game Statistics</CardTitle>
          <CardDescription>Detailed breakdown by game type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Game</th>
                  <th className="text-right p-2">Attempts</th>
                  <th className="text-right p-2">Avg Score</th>
                  <th className="text-right p-2">Best Score</th>
                </tr>
              </thead>
              <tbody>
                {gameBreakdown.map((game: any) => (
                  <tr key={game.game} className="border-b">
                    <td className="p-2">{game.game}</td>
                    <td className="text-right p-2">{game.attempts}</td>
                    <td className="text-right p-2">{parseFloat(game.avg_score).toFixed(1)}</td>
                    <td className="text-right p-2">{parseFloat(game.best_score).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
