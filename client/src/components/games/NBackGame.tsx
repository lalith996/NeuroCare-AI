'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Check, X, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { scoresAPI, gamificationAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N']
const POSITIONS = [
  { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
  { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
  { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 },
]

export function NBackGame() {
  const [nLevel, setNLevel] = useState(2) // 2-back by default
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [sequence, setSequence] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<boolean[]>([])
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)
  const [falseAlarms, setFalseAlarms] = useState(0)
  const [correctRejections, setCorrectRejections] = useState(0)
  const [responded, setResponded] = useState(false)
  const { toast } = useToast()

  const TOTAL_TRIALS = 20 + nLevel
  const TARGET_PROBABILITY = 0.3

  const generateSequence = () => {
    const seq: string[] = []
    for (let i = 0; i < TOTAL_TRIALS; i++) {
      if (i >= nLevel && Math.random() < TARGET_PROBABILITY) {
        // Target: repeat the letter from n-positions back
        seq.push(seq[i - nLevel])
      } else {
        // Non-target: random letter
        let letter = LETTERS[Math.floor(Math.random() * LETTERS.length)]
        // Make sure it's not accidentally a target
        if (i >= nLevel) {
          while (letter === seq[i - nLevel]) {
            letter = LETTERS[Math.floor(Math.random() * LETTERS.length)]
          }
        }
        seq.push(letter)
      }
    }
    return seq
  }

  const startGame = () => {
    const newSequence = generateSequence()
    setSequence(newSequence)
    setCurrentIndex(0)
    setResponses([])
    setHits(0)
    setMisses(0)
    setFalseAlarms(0)
    setCorrectRejections(0)
    setIsPlaying(true)
    setIsComplete(false)
    setResponded(false)
  }

  const handleResponse = (isMatch: boolean) => {
    if (responded || currentIndex < nLevel) return

    setResponded(true)
    const actualMatch = sequence[currentIndex] === sequence[currentIndex - nLevel]

    if (isMatch && actualMatch) {
      setHits(hits + 1)
    } else if (isMatch && !actualMatch) {
      setFalseAlarms(falseAlarms + 1)
    } else if (!isMatch && actualMatch) {
      setMisses(misses + 1)
    } else {
      setCorrectRejections(correctRejections + 1)
    }

    setResponses([...responses, isMatch])

    setTimeout(() => {
      if (currentIndex + 1 >= TOTAL_TRIALS) {
        finishGame()
      } else {
        setCurrentIndex(currentIndex + 1)
        setResponded(false)
      }
    }, 300)
  }

  const handleNoResponse = () => {
    if (currentIndex < nLevel || currentIndex >= TOTAL_TRIALS) return

    const actualMatch = sequence[currentIndex] === sequence[currentIndex - nLevel]
    if (actualMatch) {
      setMisses(misses + 1)
    } else {
      setCorrectRejections(correctRejections + 1)
    }

    setResponses([...responses, false])
  }

  useEffect(() => {
    if (!isPlaying || currentIndex >= TOTAL_TRIALS) return

    const timer = setTimeout(() => {
      if (!responded) {
        handleNoResponse()
        setTimeout(() => {
          if (currentIndex + 1 >= TOTAL_TRIALS) {
            finishGame()
          } else {
            setCurrentIndex(currentIndex + 1)
            setResponded(false)
          }
        }, 300)
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [currentIndex, isPlaying, responded])

  const finishGame = async () => {
    setIsPlaying(false)
    setIsComplete(true)

    const totalTargets = hits + misses
    const totalNonTargets = falseAlarms + correctRejections
    const accuracy = ((hits + correctRejections) / TOTAL_TRIALS) * 100
    const precision = totalTargets > 0 ? (hits / (hits + falseAlarms)) * 100 : 0
    const sensitivity = totalTargets > 0 ? (hits / totalTargets) * 100 : 0

    // D-prime calculation (signal detection theory)
    const hitRate = hits / (hits + misses || 1)
    const falseAlarmRate = falseAlarms / (falseAlarms + correctRejections || 1)
    const zHit = Math.max(-3, Math.min(3, hitRate === 1 ? 3 : hitRate === 0 ? -3 :
      Math.sqrt(2) * inverseErf(2 * hitRate - 1)))
    const zFA = Math.max(-3, Math.min(3, falseAlarmRate === 1 ? 3 : falseAlarmRate === 0 ? -3 :
      Math.sqrt(2) * inverseErf(2 * falseAlarmRate - 1)))
    const dPrime = zHit - zFA

    const finalScore = Math.max(0, Math.min(100, Math.round(
      accuracy * 0.5 + (dPrime / 4) * 25 + (nLevel / 3) * 25
    )))

    try {
      await scoresAPI.submitScore({
        gameId: 4, // N-back Test
        score: finalScore,
        timeTaken: TOTAL_TRIALS * 2.5,
        metadata: {
          nLevel,
          accuracy,
          hits,
          misses,
          falseAlarms,
          correctRejections,
          dPrime,
          sensitivity,
          precision,
        },
      })

      await gamificationAPI.updateStreak()
      await gamificationAPI.checkAchievements()

      toast({
        title: 'Test Complete! 🧠',
        description: `${nLevel}-back | Accuracy: ${accuracy.toFixed(1)}% | Score: ${finalScore}/100`,
      })
    } catch (error) {
      console.error('Error submitting score:', error)
    }
  }

  // Inverse error function approximation
  const inverseErf = (x: number) => {
    const a = 0.147
    const ln = Math.log(1 - x * x)
    const part1 = 2 / (Math.PI * a) + ln / 2
    return Math.sign(x) * Math.sqrt(Math.sqrt(part1 * part1 - ln / a) - part1)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              N-Back Test - Working Memory
            </CardTitle>
            <CardDescription>
              Press Match if the current letter matches the one {nLevel} steps back
            </CardDescription>
          </div>
          {!isPlaying && (
            <div className="flex gap-2">
              <select
                value={nLevel}
                onChange={(e) => setNLevel(Number(e.target.value))}
                className="px-3 py-2 border rounded-md"
                disabled={isPlaying}
              >
                <option value={1}>1-Back (Easy)</option>
                <option value={2}>2-Back (Medium)</option>
                <option value={3}>3-Back (Hard)</option>
              </select>
              <Button onClick={startGame}>Start Test</Button>
            </div>
          )}
          {isComplete && (
            <Button variant="outline" onClick={startGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isPlaying && !isComplete && (
          <div className="text-center py-12 space-y-4">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium mb-2">Instructions</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                You'll see a sequence of letters. Press <strong>Match</strong> if the current letter
                is the same as the one shown <strong>{nLevel} positions back</strong>. Otherwise, press
                <strong> No Match</strong> or wait.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-lg max-w-sm mx-auto">
                <p className="text-sm mb-2">{nLevel}-Back Example:</p>
                <p className="font-mono">A → B → <span className="text-green-500 font-bold">A</span> (Match!)</p>
                <p className="text-xs text-muted-foreground mt-2">
                  The 3rd letter 'A' matches the 1st letter
                </p>
              </div>
            </div>
          </div>
        )}

        {isPlaying && (
          <>
            <div className="flex gap-4 justify-center">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {currentIndex + 1}/{TOTAL_TRIALS}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {nLevel}-Back
              </Badge>
            </div>

            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-64 flex items-center justify-center bg-muted rounded-lg"
            >
              <p className="text-8xl font-bold text-primary">
                {sequence[currentIndex]}
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Button
                size="lg"
                variant="default"
                onClick={() => handleResponse(true)}
                disabled={responded || currentIndex < nLevel}
                className="h-16"
              >
                <Check className="w-6 h-6 mr-2" />
                Match
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleResponse(false)}
                disabled={responded || currentIndex < nLevel}
                className="h-16"
              >
                <X className="w-6 h-6 mr-2" />
                No Match
              </Button>
            </div>
          </>
        )}

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8 space-y-6"
          >
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Test Complete!</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="p-4 bg-green-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Hits</p>
                <p className="text-2xl font-bold text-green-500">{hits}</p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Misses</p>
                <p className="text-2xl font-bold text-red-500">{misses}</p>
              </div>
              <div className="p-4 bg-yellow-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">False Alarms</p>
                <p className="text-2xl font-bold text-yellow-600">{falseAlarms}</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Correct Rejections</p>
                <p className="text-2xl font-bold text-blue-500">{correctRejections}</p>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Accuracy</p>
                <p className="text-3xl font-bold">
                  {(((hits + correctRejections) / TOTAL_TRIALS) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center max-w-md mx-auto">
              The N-Back test measures working memory capacity, a core component of fluid intelligence
              and executive function. Higher N levels require greater cognitive resources.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
