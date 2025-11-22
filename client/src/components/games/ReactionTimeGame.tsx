'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Timer, RotateCcw, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import { scoresAPI, gamificationAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

export function ReactionTimeGame() {
  const [phase, setPhase] = useState<'idle' | 'waiting' | 'ready' | 'results'>('idle')
  const [trials, setTrials] = useState<number[]>([])
  const [currentTrial, setCurrentTrial] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [tooEarly, setTooEarly] = useState(false)
  const { toast } = useToast()

  const TOTAL_TRIALS = 10
  const MIN_WAIT = 1000
  const MAX_WAIT = 5000

  const startTest = () => {
    setTrials([])
    setCurrentTrial(0)
    setPhase('waiting')
    setTooEarly(false)
    startNextTrial()
  }

  const startNextTrial = () => {
    setPhase('waiting')
    setTooEarly(false)

    const waitTime = MIN_WAIT + Math.random() * (MAX_WAIT - MIN_WAIT)
    setTimeout(() => {
      setPhase('ready')
      setStartTime(Date.now())
    }, waitTime)
  }

  const handleClick = () => {
    if (phase === 'waiting') {
      setTooEarly(true)
      setTimeout(() => {
        if (currentTrial + 1 < TOTAL_TRIALS) {
          startNextTrial()
        } else {
          setPhase('results')
        }
      }, 1500)
    } else if (phase === 'ready') {
      const reactionTime = Date.now() - startTime
      const newTrials = [...trials, reactionTime]
      setTrials(newTrials)

      if (currentTrial + 1 < TOTAL_TRIALS) {
        setCurrentTrial(currentTrial + 1)
        setTimeout(() => startNextTrial(), 500)
      } else {
        setPhase('results')
        submitResults(newTrials)
      }
    }
  }

  const submitResults = async (trialTimes: number[]) => {
    const avgReactionTime = trialTimes.reduce((a, b) => a + b, 0) / trialTimes.length
    const minRT = Math.min(...trialTimes)
    const maxRT = Math.max(...trialTimes)
    const stdDev = Math.sqrt(
      trialTimes.reduce((sum, rt) => sum + Math.pow(rt - avgReactionTime, 2), 0) / trialTimes.length
    )

    // Score: faster and more consistent = higher score
    const speedScore = Math.max(0, 100 - avgReactionTime / 5)
    const consistencyScore = Math.max(0, 100 - stdDev / 2)
    const finalScore = Math.round((speedScore * 0.7 + consistencyScore * 0.3))

    try {
      await scoresAPI.submitScore({
        gameId: 3, // Reaction Time Test
        score: finalScore,
        timeTaken: trialTimes.length,
        metadata: {
          avgReactionTime,
          minRT,
          maxRT,
          stdDev,
          trials: trialTimes,
        },
      })

      await gamificationAPI.updateStreak()
      await gamificationAPI.checkAchievements()

      toast({
        title: 'Test Complete! ⚡',
        description: `Avg RT: ${avgReactionTime.toFixed(0)}ms | Score: ${finalScore}/100`,
      })
    } catch (error) {
      console.error('Error submitting score:', error)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Reaction Time Test - Processing Speed
            </CardTitle>
            <CardDescription>Click as fast as you can when the screen turns green</CardDescription>
          </div>
          {phase === 'idle' && <Button onClick={startTest}>Start Test</Button>}
          {phase === 'results' && (
            <Button variant="outline" onClick={startTest}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {phase === 'idle' && (
          <div className="text-center py-16 space-y-4">
            <Target className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium mb-2">Instructions</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                When the screen turns <span className="text-green-500 font-semibold">GREEN</span>,
                click as quickly as possible. Wait for it to turn green - don't click early!
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                You'll complete {TOTAL_TRIALS} trials
              </p>
            </div>
          </div>
        )}

        {phase === 'waiting' && !tooEarly && (
          <motion.div
            onClick={handleClick}
            className="h-96 bg-red-500 rounded-lg cursor-pointer flex items-center justify-center"
            whileHover={{ scale: 0.98 }}
          >
            <div className="text-center text-white">
              <p className="text-3xl font-bold mb-2">WAIT...</p>
              <p className="text-sm opacity-80">
                Trial {currentTrial + 1} of {TOTAL_TRIALS}
              </p>
            </div>
          </motion.div>
        )}

        {tooEarly && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-96 bg-yellow-500 rounded-lg flex items-center justify-center"
          >
            <div className="text-center text-white">
              <p className="text-3xl font-bold">Too Early!</p>
              <p className="text-sm mt-2">Wait for green</p>
            </div>
          </motion.div>
        )}

        {phase === 'ready' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleClick}
            className="h-96 bg-green-500 rounded-lg cursor-pointer flex items-center justify-center"
            whileHover={{ scale: 0.98 }}
          >
            <div className="text-center text-white">
              <p className="text-4xl font-bold">CLICK NOW!</p>
            </div>
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8 space-y-6"
          >
            <div className="text-center">
              <Zap className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Test Complete!</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="text-2xl font-bold">
                  {(trials.reduce((a, b) => a + b, 0) / trials.length).toFixed(0)}ms
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Fastest</p>
                <p className="text-2xl font-bold">{Math.min(...trials)}ms</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Slowest</p>
                <p className="text-2xl font-bold">{Math.max(...trials)}ms</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Trials</p>
                <p className="text-2xl font-bold">{trials.length}</p>
              </div>
            </div>

            <div className="max-w-2xl mx-auto">
              <h4 className="text-sm font-medium mb-2">All Trials:</h4>
              <div className="grid grid-cols-5 gap-2">
                {trials.map((rt, i) => (
                  <Badge key={i} variant="outline">
                    {rt}ms
                  </Badge>
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-md mx-auto">
              Processing speed is a fundamental cognitive ability that affects many aspects of
              daily functioning. Faster reaction times indicate better neural efficiency.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
