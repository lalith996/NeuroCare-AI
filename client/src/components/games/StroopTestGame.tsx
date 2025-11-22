'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Timer, RotateCcw, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { scoresAPI, gamificationAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

type TrialType = 'congruent' | 'incongruent'

interface Trial {
  word: string
  color: string
  type: TrialType
  correctAnswer: string
}

const COLORS = ['red', 'blue', 'green', 'yellow']
const COLOR_CLASSES = {
  red: 'text-red-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
  yellow: 'text-yellow-500',
}

export function StroopTestGame() {
  const [trials, setTrials] = useState<Trial[]>([])
  const [currentTrial, setCurrentTrial] = useState(0)
  const [score, setScore] = useState(0)
  const [errors, setErrors] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [gameStartTime, setGameStartTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { toast } = useToast()

  const TOTAL_TRIALS = 30

  const generateTrials = useCallback(() => {
    const newTrials: Trial[] = []
    for (let i = 0; i < TOTAL_TRIALS; i++) {
      const isCongruent = Math.random() > 0.5
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]

      if (isCongruent) {
        newTrials.push({
          word: color.toUpperCase(),
          color: color,
          type: 'congruent',
          correctAnswer: color,
        })
      } else {
        let word = COLORS[Math.floor(Math.random() * COLORS.length)]
        while (word === color) {
          word = COLORS[Math.floor(Math.random() * COLORS.length)]
        }
        newTrials.push({
          word: word.toUpperCase(),
          color: color,
          type: 'incongruent',
          correctAnswer: color,
        })
      }
    }
    return newTrials
  }, [])

  const startGame = () => {
    const newTrials = generateTrials()
    setTrials(newTrials)
    setCurrentTrial(0)
    setScore(0)
    setErrors(0)
    setReactionTimes([])
    setIsPlaying(true)
    setIsComplete(false)
    setGameStartTime(Date.now())
    setStartTime(Date.now())
  }

  const handleAnswer = (answer: string) => {
    if (!isPlaying || currentTrial >= trials.length) return

    const trial = trials[currentTrial]
    const reactionTime = Date.now() - startTime
    setReactionTimes([...reactionTimes, reactionTime])

    if (answer === trial.correctAnswer) {
      setScore(score + 1)
    } else {
      setErrors(errors + 1)
    }

    if (currentTrial + 1 >= TOTAL_TRIALS) {
      finishGame()
    } else {
      setCurrentTrial(currentTrial + 1)
      setStartTime(Date.now())
    }
  }

  const finishGame = async () => {
    setIsPlaying(false)
    setIsComplete(true)

    const totalTime = (Date.now() - gameStartTime) / 1000
    const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    const accuracy = ((score + 1) / TOTAL_TRIALS) * 100

    // Calculate interference effect (incongruent RT - congruent RT)
    const congruentTrials = trials.filter((t, i) => t.type === 'congruent' && i < currentTrial)
    const incongruentTrials = trials.filter((t, i) => t.type === 'incongruent' && i < currentTrial)

    const avgCongruentRT = congruentTrials.length > 0
      ? reactionTimes.filter((_, i) => trials[i]?.type === 'congruent').reduce((a, b) => a + b, 0) / congruentTrials.length
      : 0
    const avgIncongruentRT = incongruentTrials.length > 0
      ? reactionTimes.filter((_, i) => trials[i]?.type === 'incongruent').reduce((a, b) => a + b, 0) / incongruentTrials.length
      : 0

    const interferenceEffect = avgIncongruentRT - avgCongruentRT

    // Score calculation (higher is better)
    const accuracyScore = accuracy
    const speedScore = Math.max(0, 100 - (avgReactionTime / 10))
    const interferenceScore = Math.max(0, 100 - (interferenceEffect / 10))
    const finalScore = Math.round((accuracyScore * 0.5 + speedScore * 0.3 + interferenceScore * 0.2))

    try {
      await scoresAPI.submitScore({
        gameId: 2, // Stroop Test
        score: finalScore,
        timeTaken: totalTime,
        metadata: {
          accuracy,
          avgReactionTime,
          interferenceEffect,
          congruentRT: avgCongruentRT,
          incongruentRT: avgIncongruentRT,
          totalTrials: TOTAL_TRIALS,
          errors,
        },
      })

      await gamificationAPI.updateStreak()
      await gamificationAPI.checkAchievements()

      toast({
        title: 'Test Complete! 🎉',
        description: `Score: ${finalScore}/100 | Accuracy: ${accuracy.toFixed(1)}%`,
      })
    } catch (error) {
      console.error('Error submitting score:', error)
    }
  }

  useEffect(() => {
    if (isPlaying && trials.length > 0) {
      setStartTime(Date.now())
    }
  }, [currentTrial, isPlaying, trials.length])

  const currentTrialData = trials[currentTrial]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              Stroop Test - Attention & Executive Function
            </CardTitle>
            <CardDescription>
              Name the COLOR of the word, not the word itself
            </CardDescription>
          </div>
          {!isPlaying && !isComplete && (
            <Button onClick={startGame}>Start Test</Button>
          )}
          {(isPlaying || isComplete) && (
            <Button variant="outline" onClick={startGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Instructions */}
        {!isPlaying && !isComplete && (
          <div className="text-center py-12 space-y-4">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium mb-2">Instructions</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You will see words displayed in different colors. Click the button that matches
                the <strong>COLOR</strong> of the word, not what the word says.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg max-w-sm mx-auto">
                <p className="text-sm mb-2">Example:</p>
                <p className={`text-2xl font-bold ${COLOR_CLASSES.red}`}>BLUE</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Correct answer: RED (the color of the text)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Progress */}
        {isPlaying && (
          <>
            <div className="flex gap-4 justify-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Timer className="w-4 h-4 mr-2" />
                Trial {currentTrial + 1}/{TOTAL_TRIALS}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                Correct: {score}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                Errors: {errors}
              </Badge>
            </div>

            {/* Stimulus */}
            {currentTrialData && (
              <motion.div
                key={currentTrial}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <p
                  className={`text-6xl font-bold ${COLOR_CLASSES[currentTrialData.color as keyof typeof COLOR_CLASSES]}`}
                >
                  {currentTrialData.word}
                </p>
              </motion.div>
            )}

            {/* Answer Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {COLORS.map((color) => (
                <Button
                  key={color}
                  size="lg"
                  className="h-16"
                  style={{
                    backgroundColor: color === 'yellow' ? '#EAB308' : color,
                    color: 'white',
                  }}
                  onClick={() => handleAnswer(color)}
                >
                  {color.toUpperCase()}
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Results */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 space-y-4"
          >
            <Zap className="w-16 h-16 mx-auto text-primary" />
            <h3 className="text-2xl font-bold">Test Complete!</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Accuracy</p>
                <p className="text-2xl font-bold">
                  {((score / TOTAL_TRIALS) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Avg RT</p>
                <p className="text-2xl font-bold">
                  {(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length).toFixed(0)}ms
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Correct</p>
                <p className="text-2xl font-bold">{score}/{TOTAL_TRIALS}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold">{errors}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              The Stroop Test measures selective attention and cognitive flexibility.
              <br />
              Your results have been saved and contribute to your cognitive profile.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
