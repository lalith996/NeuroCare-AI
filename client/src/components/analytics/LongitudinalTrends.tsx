'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Calendar, Brain } from 'lucide-react'
import { motion } from 'framer-motion'

interface LongitudinalTrendsProps {
  patientCode: string
}

export function LongitudinalTrends({ patientCode }: LongitudinalTrendsProps) {
  // Fetch longitudinal data
  const { data, isLoading } = useQuery({
    queryKey: ['longitudinal-trends', patientCode],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/trends/${patientCode}`, {
        credentials: 'include',
      })
      if (!response.ok) throw new Error('Failed to fetch trends')
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Longitudinal Trend Analysis</CardTitle>
          <CardDescription>Loading trend data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Process data for charts
  const processedData = data?.scores?.map((score: any) => ({
    date: new Date(score.played_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    score: score.score,
    game_type: score.game_type,
  })) || []

  // Group by date and calculate average score per day
  const dailyAverages = processedData.reduce((acc: any, curr: any) => {
    if (!acc[curr.date]) {
      acc[curr.date] = { date: curr.date, totalScore: 0, count: 0 }
    }
    acc[curr.date].totalScore += curr.score
    acc[curr.date].count += 1
    return acc
  }, {})

  const dailyData = Object.values(dailyAverages).map((day: any) => ({
    date: day.date,
    avgScore: Math.round(day.totalScore / day.count),
  }))

  // Group by game type for comparison
  const gameTypeData = processedData.reduce((acc: any, curr: any) => {
    const gameType = curr.game_type.replace(/_/g, ' ')
    if (!acc[gameType]) {
      acc[gameType] = []
    }
    acc[gameType].push({ date: curr.date, score: curr.score })
    return acc
  }, {})

  // Calculate trend statistics
  const calculateTrend = () => {
    if (dailyData.length < 2) return { direction: 'stable', percentage: 0 }

    const recent = dailyData.slice(-7) // Last 7 days
    const previous = dailyData.slice(-14, -7) // Previous 7 days

    if (recent.length === 0 || previous.length === 0) {
      return { direction: 'stable', percentage: 0 }
    }

    const recentAvg = recent.reduce((sum: number, d: any) => sum + d.avgScore, 0) / recent.length
    const previousAvg = previous.reduce((sum: number, d: any) => sum + d.avgScore, 0) / previous.length

    const change = ((recentAvg - previousAvg) / previousAvg) * 100

    return {
      direction: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
      percentage: Math.abs(change).toFixed(1),
    }
  }

  const trend = calculateTrend()

  // Calculate cognitive domain trends
  const domainMapping: { [key: string]: string[] } = {
    'Memory': ['memory match', 'pattern recognition'],
    'Attention': ['stroop test', 'pattern recognition'],
    'Working Memory': ['n back'],
    'Processing Speed': ['reaction time', 'trail making test'],
    'Executive Function': ['stroop test', 'trail making test', 'verbal fluency'],
    'Language': ['verbal fluency'],
  }

  const domainTrends = Object.entries(domainMapping).map(([domain, games]) => {
    const domainScores = processedData.filter((score: any) =>
      games.some(game => score.game_type.toLowerCase().includes(game))
    )

    if (domainScores.length === 0) return { domain, avgScore: 0, trend: 0, count: 0 }

    const avgScore = domainScores.reduce((sum: number, s: any) => sum + s.score, 0) / domainScores.length

    // Calculate trend for this domain
    const recent = domainScores.slice(-5)
    const previous = domainScores.slice(-10, -5)

    let domainTrend = 0
    if (recent.length > 0 && previous.length > 0) {
      const recentAvg = recent.reduce((sum: number, s: any) => sum + s.score, 0) / recent.length
      const previousAvg = previous.reduce((sum: number, s: any) => sum + s.score, 0) / previous.length
      domainTrend = ((recentAvg - previousAvg) / previousAvg) * 100
    }

    return {
      domain,
      avgScore: Math.round(avgScore),
      trend: Math.round(domainTrend * 10) / 10,
      count: domainScores.length,
    }
  }).filter(d => d.count > 0)

  return (
    <div className="space-y-6">
      {/* Trend Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Longitudinal Trend Analysis
          </CardTitle>
          <CardDescription>
            Track your cognitive performance over time and identify patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Overall Trend</h4>
                {trend.direction === 'improving' && <TrendingUp className="w-5 h-5 text-green-600" />}
                {trend.direction === 'declining' && <TrendingDown className="w-5 h-5 text-red-600" />}
                {trend.direction === 'stable' && <Minus className="w-5 h-5 text-yellow-600" />}
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                {trend.direction}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {trend.percentage}% change (last 7 days)
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Total Sessions</h4>
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data?.statistics?.total_games || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Cognitive training sessions
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300">Average Score</h4>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data?.statistics?.avg_score || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Overall performance
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="overall" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overall">Overall Performance</TabsTrigger>
          <TabsTrigger value="domains">Domain Trends</TabsTrigger>
          <TabsTrigger value="games">Game Comparison</TabsTrigger>
        </TabsList>

        {/* Overall Performance Chart */}
        <TabsContent value="overall">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Daily average scores across all games</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Trends */}
        <TabsContent value="domains">
          <Card>
            <CardHeader>
              <CardTitle>Cognitive Domain Performance</CardTitle>
              <CardDescription>Average scores and trends by cognitive domain</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={domainTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="domain" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#8884d8" name="Average Score" />
                </BarChart>
              </ResponsiveContainer>

              {/* Domain Trend Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {domainTrends.map((domain) => (
                  <div key={domain.domain} className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">{domain.domain}</h4>
                    <div className="flex items-center gap-2">
                      {domain.trend > 5 && <TrendingUp className="w-4 h-4 text-green-600" />}
                      {domain.trend < -5 && <TrendingDown className="w-4 h-4 text-red-600" />}
                      {Math.abs(domain.trend) <= 5 && <Minus className="w-4 h-4 text-yellow-600" />}
                      <span className="text-sm text-muted-foreground">
                        {domain.trend > 0 ? '+' : ''}{domain.trend}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Game Comparison */}
        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Game-by-Game Performance</CardTitle>
              <CardDescription>Compare performance across different cognitive games</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    type="category"
                    allowDuplicatedCategory={false}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {Object.entries(gameTypeData).map(([gameType, scores]: [string, any], index) => (
                    <Line
                      key={gameType}
                      data={scores}
                      type="monotone"
                      dataKey="score"
                      name={gameType.charAt(0).toUpperCase() + gameType.slice(1)}
                      stroke={[
                        '#8884d8',
                        '#82ca9d',
                        '#ffc658',
                        '#ff7c7c',
                        '#8dd1e1',
                        '#d084d0',
                        '#a4de6c',
                      ][index % 7]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insights Card */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Insights</CardTitle>
          <CardDescription>AI-powered analysis of your cognitive trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trend.direction === 'improving' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100">
                      Positive Trend Detected
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Your cognitive performance has improved by {trend.percentage}% over the last week.
                      This suggests effective cognitive training and good engagement.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trend.direction === 'declining' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-100">
                      Attention Required
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Your performance has declined by {trend.percentage}% recently. Consider consulting
                      with your doctor and maintaining regular cognitive training.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {trend.direction === 'stable' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Minus className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                      Stable Performance
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Your cognitive performance is stable with minimal change ({trend.percentage}%).
                      Continue your current training routine and monitor regularly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Domain-specific insights */}
            {domainTrends.filter(d => Math.abs(d.trend) > 10).length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Domain-Specific Observations
                </h4>
                <ul className="space-y-2">
                  {domainTrends
                    .filter(d => Math.abs(d.trend) > 10)
                    .map(domain => (
                      <li key={domain.domain} className="text-sm text-blue-700 dark:text-blue-300">
                        <strong>{domain.domain}:</strong>{' '}
                        {domain.trend > 0 ? 'Improving' : 'Declining'} by {Math.abs(domain.trend)}%
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
