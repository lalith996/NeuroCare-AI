'use client'

import { useQuery } from '@tanstack/react-query'
import { progressAPI } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts'
import { Brain, TrendingUp, TrendingDown } from 'lucide-react'

interface CognitiveFingerprintProps {
  patientCode: string
}

// Map games to cognitive domains
const GAME_DOMAIN_MAP: Record<string, string> = {
  'Memory Match': 'memory',
  'memory-match': 'memory',
  'Stroop Test': 'attention',
  'stroop-test': 'attention',
  'Reaction Time': 'processing_speed',
  'reaction-time': 'processing_speed',
  'N-Back': 'working_memory',
  'n-back': 'working_memory',
  'Trail Making': 'executive_function',
  'trail-making': 'executive_function',
}

export function CognitiveFingerprint({ patientCode }: CognitiveFingerprintProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['patient-progress', patientCode, 90],
    queryFn: async () => {
      const response = await progressAPI.getPatientProgress(patientCode, 90)
      return response.data
    },
  })

  if (isLoading) {
    return <div>Loading cognitive profile...</div>
  }

  const gameBreakdown = data?.gameBreakdown || []

  // Calculate domain scores
  const domainScores = {
    memory: { score: 0, count: 0, label: 'Memory' },
    attention: { score: 0, count: 0, label: 'Attention' },
    working_memory: { score: 0, count: 0, label: 'Working Memory' },
    processing_speed: { score: 0, count: 0, label: 'Processing Speed' },
    executive_function: { score: 0, count: 0, label: 'Executive Function' },
    language: { score: 0, count: 0, label: 'Language' },
  }

  // Aggregate scores by domain
  gameBreakdown.forEach((game: any) => {
    const domain = GAME_DOMAIN_MAP[game.game] || 'general'
    if (domainScores[domain as keyof typeof domainScores]) {
      domainScores[domain as keyof typeof domainScores].score += parseFloat(game.avg_score)
      domainScores[domain as keyof typeof domainScores].count += 1
    }
  })

  // Calculate average scores per domain
  const radarData = Object.entries(domainScores).map(([key, value]) => ({
    domain: value.label,
    score: value.count > 0 ? (value.score / value.count) : 0,
    fullMark: 100,
  }))

  // Calculate overall cognitive score
  const totalScore = radarData.reduce((sum, d) => sum + d.score, 0)
  const avgScore = radarData.length > 0 ? totalScore / radarData.length : 0

  // Identify strengths and weaknesses
  const sortedDomains = [...radarData].sort((a, b) => b.score - a.score)
  const strengths = sortedDomains.slice(0, 2).filter(d => d.score > 0)
  const weaknesses = sortedDomains.slice(-2).filter(d => d.score > 0 && d.score < 70)

  // Calculate cognitive reserve index (simplified)
  const cognitiveReserve = Math.min(100, Math.round(
    avgScore * 0.6 + // Performance score
    (data?.statistics?.total_games || 0) * 0.2 + // Engagement
    ((data?.trend?.improvement || 0) > 0 ? 20 : 0) // Improvement bonus
  ))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Cognitive Fingerprint
          </CardTitle>
          <CardDescription>
            Multi-domain cognitive profile based on assessment performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Radar Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="domain" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Cognitive Score"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Overall Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Overall Cognitive Score</p>
              <p className="text-3xl font-bold">{avgScore.toFixed(1)}/100</p>
              <p className="text-xs text-muted-foreground mt-1">
                {avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : avgScore >= 40 ? 'Fair' : 'Needs Attention'}
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Cognitive Reserve Index</p>
              <p className="text-3xl font-bold">{cognitiveReserve}/100</p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on performance & engagement
              </p>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Trend</p>
              <div className="flex items-center gap-2">
                {(data?.trend?.improvement || 0) > 0 ? (
                  <>
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <span className="text-2xl font-bold text-green-500">
                      +{data?.trend?.improvement?.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-6 h-6 text-red-500" />
                    <span className="text-2xl font-bold text-red-500">
                      {data?.trend?.improvement?.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">vs previous period</p>
            </div>
          </div>

          {/* Domain Details */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Domain Scores</h4>
            {radarData.filter(d => d.score > 0).map((domain) => (
              <div key={domain.domain} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{domain.domain}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${domain.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">
                    {domain.score.toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strengths.length > 0 && (
              <div className="p-4 bg-green-500/10 rounded-lg">
                <h4 className="font-medium text-sm text-green-700 dark:text-green-400 mb-2">
                  Cognitive Strengths
                </h4>
                <ul className="space-y-1">
                  {strengths.map((s) => (
                    <li key={s.domain} className="text-sm">
                      • {s.domain} ({s.score.toFixed(0)}/100)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {weaknesses.length > 0 && (
              <div className="p-4 bg-yellow-500/10 rounded-lg">
                <h4 className="font-medium text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                  Areas for Improvement
                </h4>
                <ul className="space-y-1">
                  {weaknesses.map((w) => (
                    <li key={w.domain} className="text-sm">
                      • {w.domain} ({w.score.toFixed(0)}/100)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Clinical Interpretation */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Clinical Interpretation</h4>
            <p className="text-sm text-muted-foreground">
              {avgScore >= 80
                ? 'Cognitive performance is within the excellent range across all assessed domains. Continue current cognitive activities to maintain brain health.'
                : avgScore >= 60
                ? 'Cognitive performance is within the good range. Some domains show relative strengths. Consider targeted exercises for areas showing lower performance.'
                : avgScore >= 40
                ? 'Cognitive performance shows variability across domains. Recommend continued monitoring and targeted cognitive training in weaker areas.'
                : 'Cognitive performance indicates need for clinical attention. Recommend comprehensive neuropsychological evaluation and consultation with a specialist.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
