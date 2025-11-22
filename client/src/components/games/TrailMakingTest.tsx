'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Check, X, RotateCcw, Trophy, Timer } from 'lucide-react'

interface Circle {
  id: string
  x: number
  y: number
  completed: boolean
}

type TestPart = 'A' | 'B'

const TrailMakingTest = () => {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'complete'>('intro')
  const [testPart, setTestPart] = useState<TestPart>('A')
  const [circles, setCircles] = useState<Circle[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [path, setPath] = useState<{ x: number; y: number }[]>([])
  const [errors, setErrors] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [partATime, setPartATime] = useState<number | null>(null)
  const [partBTime, setPartBTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  const CANVAS_WIDTH = 600
  const CANVAS_HEIGHT = 600
  const CIRCLE_RADIUS = 30
  const PART_A_COUNT = 15
  const PART_B_COUNT = 13 // 13 circles for alternating numbers and letters

  // Generate random positions for circles
  const generateCircles = (part: TestPart): Circle[] => {
    const newCircles: Circle[] = []
    const minDistance = 80 // Minimum distance between circles
    const padding = 60

    if (part === 'A') {
      // Part A: Numbers 1-15
      for (let i = 1; i <= PART_A_COUNT; i++) {
        let position: { x: number; y: number }
        let attempts = 0

        do {
          position = {
            x: padding + Math.random() * (CANVAS_WIDTH - 2 * padding),
            y: padding + Math.random() * (CANVAS_HEIGHT - 2 * padding)
          }
          attempts++
        } while (
          attempts < 100 &&
          newCircles.some(
            circle =>
              Math.sqrt(
                Math.pow(circle.x - position.x, 2) + Math.pow(circle.y - position.y, 2)
              ) < minDistance
          )
        )

        newCircles.push({
          id: i.toString(),
          x: position.x,
          y: position.y,
          completed: false
        })
      }
    } else {
      // Part B: Alternating numbers and letters (1-A-2-B-3-C...)
      const sequence: string[] = []
      for (let i = 1; i <= 7; i++) {
        sequence.push(i.toString())
        if (i <= 6) {
          sequence.push(String.fromCharCode(64 + i)) // A-F
        }
      }

      sequence.forEach(id => {
        let position: { x: number; y: number }
        let attempts = 0

        do {
          position = {
            x: padding + Math.random() * (CANVAS_WIDTH - 2 * padding),
            y: padding + Math.random() * (CANVAS_HEIGHT - 2 * padding)
          }
          attempts++
        } while (
          attempts < 100 &&
          newCircles.some(
            circle =>
              Math.sqrt(
                Math.pow(circle.x - position.x, 2) + Math.pow(circle.y - position.y, 2)
              ) < minDistance
          )
        )

        newCircles.push({
          id,
          x: position.x,
          y: position.y,
          completed: false
        })
      })
    }

    return newCircles
  }

  // Get the expected sequence
  const getExpectedSequence = (part: TestPart): string[] => {
    if (part === 'A') {
      return Array.from({ length: PART_A_COUNT }, (_, i) => (i + 1).toString())
    } else {
      const sequence: string[] = []
      for (let i = 1; i <= 7; i++) {
        sequence.push(i.toString())
        if (i <= 6) {
          sequence.push(String.fromCharCode(64 + i))
        }
      }
      return sequence
    }
  }

  // Start test
  const startTest = (part: TestPart) => {
    setTestPart(part)
    setCircles(generateCircles(part))
    setCurrentIndex(0)
    setPath([])
    setErrors(0)
    setStartTime(Date.now())
    setElapsedTime(0)
    setGameState('playing')
  }

  // Handle circle click
  const handleCircleClick = (clickedCircle: Circle) => {
    const expectedSequence = getExpectedSequence(testPart)
    const expectedId = expectedSequence[currentIndex]

    if (clickedCircle.id === expectedId) {
      // Correct click
      const updatedCircles = circles.map(c =>
        c.id === clickedCircle.id ? { ...c, completed: true } : c
      )
      setCircles(updatedCircles)
      setPath([...path, { x: clickedCircle.x, y: clickedCircle.y }])

      if (currentIndex + 1 === expectedSequence.length) {
        // Test part completed
        const completionTime = Date.now() - startTime

        if (testPart === 'A') {
          setPartATime(completionTime)
          // Automatically start Part B after Part A
          setTimeout(() => {
            startTest('B')
          }, 2000)
        } else {
          setPartBTime(completionTime)
          completeGame()
        }
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    } else {
      // Incorrect click
      setErrors(errors + 1)
    }
  }

  // Complete game and submit results
  const completeGame = async () => {
    setGameState('complete')

    if (partATime && partBTime) {
      const totalTime = partATime + partBTime
      const errorPenalty = errors * 5000 // 5 seconds per error

      // Calculate cognitive flexibility score (Part B - Part A)
      const flexibilityScore = partBTime - partATime

      // Calculate final score (lower time = higher score)
      const baseScore = Math.max(0, 100 - (totalTime + errorPenalty) / 1000)
      const finalScore = Math.round(baseScore)

      try {
        const response = await fetch('/api/games/submit-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            game_type: 'trail_making_test',
            score: finalScore,
            performance_data: {
              part_a_time: partATime,
              part_b_time: partBTime,
              total_time: totalTime,
              errors: errors,
              flexibility_score: flexibilityScore
            }
          })
        })

        if (!response.ok) {
          console.error('Failed to submit score')
        }
      } catch (error) {
        console.error('Error submitting score:', error)
      }
    }
  }

  // Reset game
  const resetGame = () => {
    setGameState('intro')
    setTestPart('A')
    setPartATime(null)
    setPartBTime(null)
    setErrors(0)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime)
      }, 100)
    }
    return () => clearInterval(interval)
  }, [gameState, startTime])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">Trail Making Test</h1>
          </div>
          <p className="text-gray-600">Measure processing speed, visual attention, and cognitive flexibility</p>
        </div>

        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {gameState === 'intro' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Play</h2>
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="font-semibold text-lg text-blue-600 mb-3">Part A: Numbers</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <p className="text-gray-700">Connect circles with numbers in ascending order (1→2→3...)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">2</span>
                      </div>
                      <p className="text-gray-700">Work as quickly and accurately as possible</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-cyan-600 mb-3">Part B: Numbers & Letters</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-cyan-600 font-bold">1</span>
                      </div>
                      <p className="text-gray-700">Alternate between numbers and letters (1→A→2→B→3→C...)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-cyan-600 font-bold">2</span>
                      </div>
                      <p className="text-gray-700">This tests your cognitive flexibility and set-shifting ability</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Each error adds a 5-second penalty. Try to be accurate!
                  </p>
                </div>
              </div>

              <button
                onClick={() => startTest('A')}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
              >
                Start Test
              </button>
            </motion.div>
          )}

          {/* Playing Screen */}
          {gameState === 'playing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Part {testPart}
                    {testPart === 'A' && ' - Numbers'}
                    {testPart === 'B' && ' - Numbers & Letters'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Next: <span className="font-semibold text-blue-600">
                      {getExpectedSequence(testPart)[currentIndex]}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-gray-700 mb-2">
                    <Timer className="w-5 h-5" />
                    <span className="text-2xl font-mono font-bold">
                      {(elapsedTime / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <p className="text-sm text-red-600">Errors: {errors}</p>
                </div>
              </div>

              {/* Canvas */}
              <div
                ref={canvasRef}
                className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200"
                style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, margin: '0 auto' }}
              >
                {/* Draw path */}
                <svg
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  {path.map((point, index) => {
                    if (index === 0) return null
                    const prev = path[index - 1]
                    return (
                      <line
                        key={index}
                        x1={prev.x}
                        y1={prev.y}
                        x2={point.x}
                        y2={point.y}
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    )
                  })}
                </svg>

                {/* Draw circles */}
                {circles.map(circle => (
                  <motion.button
                    key={circle.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => handleCircleClick(circle)}
                    disabled={circle.completed}
                    className={`absolute rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      circle.completed
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : 'bg-white text-gray-800 hover:bg-blue-100 border-2 border-blue-400 cursor-pointer shadow-lg'
                    }`}
                    style={{
                      width: CIRCLE_RADIUS * 2,
                      height: CIRCLE_RADIUS * 2,
                      left: circle.x - CIRCLE_RADIUS,
                      top: circle.y - CIRCLE_RADIUS,
                      zIndex: 2
                    }}
                  >
                    {circle.completed ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      circle.id
                    )}
                  </motion.button>
                ))}
              </div>

              {partATime && testPart === 'B' && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Part A completed in {(partATime / 1000).toFixed(1)}s
                </div>
              )}
            </motion.div>
          )}

          {/* Complete Screen */}
          {gameState === 'complete' && partATime && partBTime && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="text-center mb-8">
                <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Complete!</h2>
                <p className="text-gray-600">Here are your results</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Part A Time</p>
                  <p className="text-3xl font-bold text-blue-600">{(partATime / 1000).toFixed(2)}s</p>
                  <p className="text-xs text-gray-500 mt-1">Processing Speed</p>
                </div>
                <div className="bg-cyan-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Part B Time</p>
                  <p className="text-3xl font-bold text-cyan-600">{(partBTime / 1000).toFixed(2)}s</p>
                  <p className="text-xs text-gray-500 mt-1">Cognitive Flexibility</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Time</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {((partATime + partBTime) / 1000).toFixed(2)}s
                  </p>
                </div>
                <div className="bg-red-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Errors</p>
                  <p className="text-3xl font-bold text-red-600">{errors}</p>
                  <p className="text-xs text-gray-500 mt-1">{errors * 5}s penalty</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Cognitive Flexibility Score</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {((partBTime - partATime) / 1000).toFixed(2)}s
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This measures your ability to switch between different mental sets.
                  Lower is better!
                </p>
              </div>

              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default TrailMakingTest
