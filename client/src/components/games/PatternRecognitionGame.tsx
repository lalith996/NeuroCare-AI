'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Check, X, RotateCcw, Trophy } from 'lucide-react'

interface Pattern {
  id: number
  grid: number[][]
  correctAnswer: number
}

const GRID_SIZE = 4
const PATTERN_DISPLAY_TIME = 3000 // 3 seconds to memorize
const TOTAL_ROUNDS = 10

const PatternRecognitionGame = () => {
  const [gameState, setGameState] = useState<'intro' | 'memorize' | 'recall' | 'feedback' | 'complete'>('intro')
  const [currentRound, setCurrentRound] = useState(0)
  const [score, setScore] = useState(0)
  const [pattern, setPattern] = useState<Pattern | null>(null)
  const [options, setOptions] = useState<number[][][]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [roundStartTime, setRoundStartTime] = useState<number>(0)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')

  // Generate a random pattern based on difficulty
  const generatePattern = (): number[][] => {
    const grid: number[][] = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0))
    const cellsToFill = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 8 : 10

    const positions = new Set<string>()
    while (positions.size < cellsToFill) {
      const row = Math.floor(Math.random() * GRID_SIZE)
      const col = Math.floor(Math.random() * GRID_SIZE)
      positions.add(`${row},${col}`)
    }

    positions.forEach(pos => {
      const [row, col] = pos.split(',').map(Number)
      grid[row][col] = 1
    })

    return grid
  }

  // Generate similar but incorrect patterns
  const generateDistractors = (original: number[][], count: number): number[][][] => {
    const distractors: number[][][] = []

    for (let i = 0; i < count; i++) {
      const distractor = original.map(row => [...row])

      // Make 2-3 changes to the pattern
      const changes = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4
      for (let j = 0; j < changes; j++) {
        const row = Math.floor(Math.random() * GRID_SIZE)
        const col = Math.floor(Math.random() * GRID_SIZE)
        distractor[row][col] = distractor[row][col] === 1 ? 0 : 1
      }

      distractors.push(distractor)
    }

    return distractors
  }

  // Start a new round
  const startRound = () => {
    const newPattern = generatePattern()
    const distractors = generateDistractors(newPattern, 3)
    const correctIndex = Math.floor(Math.random() * 4)

    const allOptions = [...distractors]
    allOptions.splice(correctIndex, 0, newPattern)

    setPattern({ id: currentRound, grid: newPattern, correctAnswer: correctIndex })
    setOptions(allOptions)
    setSelectedOption(null)
    setIsCorrect(null)
    setGameState('memorize')

    // After display time, move to recall phase
    setTimeout(() => {
      setGameState('recall')
      setRoundStartTime(Date.now())
    }, PATTERN_DISPLAY_TIME)
  }

  // Handle option selection
  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return

    const reactionTime = Date.now() - roundStartTime
    setReactionTimes([...reactionTimes, reactionTime])
    setSelectedOption(index)

    const correct = index === pattern?.correctAnswer
    setIsCorrect(correct)

    if (correct) {
      setScore(score + 1)
    }

    setGameState('feedback')

    // Move to next round after feedback
    setTimeout(() => {
      if (currentRound + 1 < TOTAL_ROUNDS) {
        setCurrentRound(currentRound + 1)
        startRound()
      } else {
        completeGame()
      }
    }, 1500)
  }

  // Complete the game and submit results
  const completeGame = async () => {
    setGameState('complete')

    const avgReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
    const accuracy = (score / TOTAL_ROUNDS) * 100

    // Calculate final score (accuracy 70%, speed 30%)
    const speedScore = Math.max(0, 100 - avgReactionTime / 50)
    const finalScore = Math.round((accuracy * 0.7) + (speedScore * 0.3))

    try {
      const response = await fetch('/api/games/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          game_type: 'pattern_recognition',
          score: finalScore,
          performance_data: {
            accuracy,
            avg_reaction_time: avgReactionTime,
            difficulty,
            rounds_completed: TOTAL_ROUNDS,
            correct_answers: score
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

  // Reset game
  const resetGame = () => {
    setGameState('intro')
    setCurrentRound(0)
    setScore(0)
    setReactionTimes([])
    setPattern(null)
    setOptions([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">Pattern Recognition</h1>
          </div>
          <p className="text-gray-600">Test your visual-spatial memory and pattern matching abilities</p>
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
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">1</span>
                  </div>
                  <p className="text-gray-700">A pattern will be displayed on a 4×4 grid for 3 seconds</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <p className="text-gray-700">Memorize the pattern carefully</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <p className="text-gray-700">Select the correct pattern from 4 options</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">4</span>
                  </div>
                  <p className="text-gray-700">Complete {TOTAL_ROUNDS} rounds to finish the test</p>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Difficulty:</label>
                <div className="flex gap-4">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                        difficulty === level
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startRound}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Start Game
              </button>
            </motion.div>
          )}

          {/* Memorize Phase */}
          {gameState === 'memorize' && pattern && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="text-center mb-6">
                <p className="text-xl font-semibold text-gray-800">Round {currentRound + 1} of {TOTAL_ROUNDS}</p>
                <p className="text-gray-600 mt-2">Memorize this pattern...</p>
              </div>

              <div className="flex justify-center">
                <div className="grid grid-cols-4 gap-3 bg-gray-100 p-6 rounded-xl">
                  {pattern.grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <motion.div
                        key={`${rowIndex}-${colIndex}`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: (rowIndex * 4 + colIndex) * 0.05 }}
                        className={`w-16 h-16 rounded-lg ${
                          cell === 1
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg'
                            : 'bg-white border-2 border-gray-300'
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="text-sm text-gray-500">Pattern disappears in...</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">
                  {Math.ceil((PATTERN_DISPLAY_TIME - (Date.now() - (Date.now() % 1000))) / 1000)}s
                </div>
              </div>
            </motion.div>
          )}

          {/* Recall Phase */}
          {gameState === 'recall' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="text-center mb-6">
                <p className="text-xl font-semibold text-gray-800">Round {currentRound + 1} of {TOTAL_ROUNDS}</p>
                <p className="text-gray-600 mt-2">Which pattern did you see?</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    className="bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-all border-2 border-transparent hover:border-purple-400"
                  >
                    <div className="grid grid-cols-4 gap-2">
                      {option.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-10 h-10 rounded ${
                              cell === 1
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                : 'bg-white border border-gray-300'
                            }`}
                          />
                        ))
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                Score: {score}/{currentRound}
              </div>
            </motion.div>
          )}

          {/* Feedback Phase */}
          {gameState === 'feedback' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`bg-white rounded-2xl shadow-xl p-8 border-4 ${
                isCorrect ? 'border-green-400' : 'border-red-400'
              }`}
            >
              <div className="text-center">
                {isCorrect ? (
                  <>
                    <Check className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Correct!</h3>
                    <p className="text-gray-600">Great pattern recognition!</p>
                  </>
                ) : (
                  <>
                    <X className="w-20 h-20 text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-600 mb-2">Incorrect</h3>
                    <p className="text-gray-600">Keep practicing!</p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Complete Screen */}
          {gameState === 'complete' && (
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

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-purple-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Accuracy</p>
                  <p className="text-3xl font-bold text-purple-600">{((score / TOTAL_ROUNDS) * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-indigo-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Avg. Reaction Time</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length / 1000).toFixed(2)}s
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Correct Answers</p>
                  <p className="text-3xl font-bold text-green-600">{score}/{TOTAL_ROUNDS}</p>
                </div>
                <div className="bg-yellow-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Difficulty</p>
                  <p className="text-3xl font-bold text-yellow-600 capitalize">{difficulty}</p>
                </div>
              </div>

              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
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

export default PatternRecognitionGame
