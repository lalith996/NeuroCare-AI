'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, MessageSquare, RotateCcw, Trophy, Timer, AlertCircle } from 'lucide-react'

type TestType = 'semantic' | 'phonemic'

interface TestRound {
  type: TestType
  prompt: string
  timeLimit: number
}

const SEMANTIC_CATEGORIES = [
  { prompt: 'Animals', examples: 'dog, cat, elephant...' },
  { prompt: 'Foods', examples: 'apple, bread, rice...' },
  { prompt: 'Colors', examples: 'red, blue, green...' },
  { prompt: 'Countries', examples: 'USA, Japan, France...' },
  { prompt: 'Sports', examples: 'football, tennis, swimming...' }
]

const PHONEMIC_LETTERS = ['F', 'A', 'S', 'P', 'T', 'L']

const TIME_LIMIT = 60 // 60 seconds per round

const VerbalFluencyTest = () => {
  const [gameState, setGameState] = useState<'intro' | 'instructions' | 'playing' | 'complete'>('intro')
  const [testType, setTestType] = useState<TestType>('semantic')
  const [currentRound, setCurrentRound] = useState<TestRound | null>(null)
  const [words, setWords] = useState<string[]>([])
  const [currentWord, setCurrentWord] = useState('')
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [startTime, setStartTime] = useState(0)
  const [semanticScore, setSemanticScore] = useState<number | null>(null)
  const [phonemicScore, setPhonemicScore] = useState<number | null>(null)
  const [duplicateError, setDuplicateError] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Start a test round
  const startRound = (type: TestType) => {
    let round: TestRound

    if (type === 'semantic') {
      const category = SEMANTIC_CATEGORIES[Math.floor(Math.random() * SEMANTIC_CATEGORIES.length)]
      round = {
        type: 'semantic',
        prompt: category.prompt,
        timeLimit: TIME_LIMIT
      }
    } else {
      const letter = PHONEMIC_LETTERS[Math.floor(Math.random() * PHONEMIC_LETTERS.length)]
      round = {
        type: 'phonemic',
        prompt: letter,
        timeLimit: TIME_LIMIT
      }
    }

    setCurrentRound(round)
    setWords([])
    setCurrentWord('')
    setTimeLeft(TIME_LIMIT)
    setStartTime(Date.now())
    setDuplicateError(false)
    setValidationError(null)
    setGameState('playing')

    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // Validate word
  const validateWord = (word: string, type: TestType, prompt: string): string | null => {
    if (word.length < 2) {
      return 'Word must be at least 2 letters'
    }

    if (type === 'phonemic') {
      if (!word.toLowerCase().startsWith(prompt.toLowerCase())) {
        return `Word must start with "${prompt}"`
      }
    }

    // Check for proper names (basic check)
    if (word[0] === word[0].toUpperCase() && word.length > 1) {
      return 'Proper names are not allowed'
    }

    return null
  }

  // Add word
  const addWord = () => {
    const trimmedWord = currentWord.trim().toLowerCase()

    if (!trimmedWord) return

    // Check for duplicates
    if (words.includes(trimmedWord)) {
      setDuplicateError(true)
      setTimeout(() => setDuplicateError(false), 2000)
      return
    }

    // Validate word
    if (currentRound) {
      const error = validateWord(trimmedWord, currentRound.type, currentRound.prompt)
      if (error) {
        setValidationError(error)
        setTimeout(() => setValidationError(null), 3000)
        return
      }
    }

    setWords([...words, trimmedWord])
    setCurrentWord('')
    setDuplicateError(false)
    setValidationError(null)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addWord()
    }
  }

  // Remove word
  const removeWord = (index: number) => {
    setWords(words.filter((_, i) => i !== index))
  }

  // Complete round
  const completeRound = async () => {
    if (!currentRound) return

    const wordCount = words.length
    const uniqueWords = new Set(words).size
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length || 0

    // Calculate score (words per minute normalized to 100)
    const score = Math.min(100, Math.round((wordCount / TIME_LIMIT) * 60 * 5))

    if (currentRound.type === 'semantic') {
      setSemanticScore(score)

      // If semantic test done, move to phonemic
      setTimeout(() => {
        setGameState('instructions')
        setTestType('phonemic')
      }, 2000)
    } else {
      setPhonemicScore(score)
      await submitResults(semanticScore!, score, wordCount)
      setGameState('complete')
    }
  }

  // Submit results
  const submitResults = async (semantic: number, phonemic: number, totalWords: number) => {
    const finalScore = Math.round((semantic + phonemic) / 2)

    try {
      const response = await fetch('/api/games/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          game_type: 'verbal_fluency',
          score: finalScore,
          performance_data: {
            semantic_score: semantic,
            phonemic_score: phonemic,
            total_words: totalWords,
            test_duration: TIME_LIMIT * 2
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
    setTestType('semantic')
    setSemanticScore(null)
    setPhonemicScore(null)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeRound()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState, timeLeft])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">Verbal Fluency Test</h1>
          </div>
          <p className="text-gray-600">Measure language production, semantic memory, and executive function</p>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6">About This Test</h2>

              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="font-semibold text-lg text-green-600 mb-3">Part 1: Semantic Fluency</h3>
                  <p className="text-gray-700 mb-2">
                    Name as many words as possible from a given category (e.g., animals, foods).
                  </p>
                  <p className="text-sm text-gray-500">
                    Tests: Semantic memory, category knowledge
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-emerald-600 mb-3">Part 2: Phonemic Fluency</h3>
                  <p className="text-gray-700 mb-2">
                    Name as many words as possible that start with a specific letter.
                  </p>
                  <p className="text-sm text-gray-500">
                    Tests: Lexical retrieval, phonological processing
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Rules:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• You have 60 seconds for each part</li>
                    <li>• No proper names (people, places, brands)</li>
                    <li>• No repetitions</li>
                    <li>• Words must be at least 2 letters long</li>
                    <li>• Type each word and press Enter</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  setGameState('instructions')
                  setTestType('semantic')
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                Start Test
              </button>
            </motion.div>
          )}

          {/* Instructions Screen */}
          {gameState === 'instructions' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="text-center mb-8">
                <MessageSquare className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Part {testType === 'semantic' ? '1' : '2'}: {testType === 'semantic' ? 'Semantic' : 'Phonemic'} Fluency
                </h2>
                <p className="text-gray-600">Get ready to start!</p>
              </div>

              {testType === 'semantic' && (
                <div className="bg-green-50 p-6 rounded-xl mb-6">
                  <p className="text-lg text-gray-700 mb-2">
                    You will be given a <strong>category</strong>. Name as many items from that category as you can.
                  </p>
                  <p className="text-sm text-gray-600">
                    Example: If the category is "Animals", you could say: dog, cat, elephant, lion...
                  </p>
                </div>
              )}

              {testType === 'phonemic' && (
                <div className="bg-emerald-50 p-6 rounded-xl mb-6">
                  <p className="text-lg text-gray-700 mb-2">
                    You will be given a <strong>letter</strong>. Name as many words that start with that letter as you can.
                  </p>
                  <p className="text-sm text-gray-600">
                    Example: If the letter is "F", you could say: fish, fork, friend, flower...
                  </p>
                </div>
              )}

              <button
                onClick={() => startRound(testType)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                Begin Part {testType === 'semantic' ? '1' : '2'}
              </button>
            </motion.div>
          )}

          {/* Playing Screen */}
          {gameState === 'playing' && currentRound && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              {/* Timer and Prompt */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {currentRound.type === 'semantic' ? 'Category' : 'Letter'}:
                    <span className="text-green-600 ml-2">{currentRound.prompt}</span>
                  </h3>
                  {currentRound.type === 'semantic' && (
                    <p className="text-sm text-gray-600 mt-1">
                      {SEMANTIC_CATEGORIES.find(c => c.prompt === currentRound.prompt)?.examples}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Timer className="w-6 h-6" />
                    <span className={`text-4xl font-mono font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                      {timeLeft}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentWord}
                    onChange={(e) => setCurrentWord(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a word and press Enter..."
                    className={`w-full px-6 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      duplicateError || validationError
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300'
                    }`}
                    autoComplete="off"
                    autoFocus
                  />
                  <button
                    onClick={addWord}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-all font-semibold"
                  >
                    Add
                  </button>
                </div>

                {duplicateError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm mt-2 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    You already said that word!
                  </motion.p>
                )}

                {validationError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-sm mt-2 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {validationError}
                  </motion.p>
                )}
              </div>

              {/* Word Count */}
              <div className="mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-gray-700">Your Words ({words.length})</h4>
                  <p className="text-sm text-gray-500">Click a word to remove it</p>
                </div>
              </div>

              {/* Words List */}
              <div className="bg-gray-50 rounded-xl p-4 min-h-[200px] max-h-[300px] overflow-y-auto">
                {words.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No words yet. Start typing!</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {words.map((word, index) => (
                      <motion.button
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => removeWord(index)}
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-red-100 hover:text-red-800 transition-all font-medium"
                      >
                        {word}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Complete Screen */}
          {gameState === 'complete' && semanticScore !== null && phonemicScore !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="text-center mb-8">
                <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Complete!</h2>
                <p className="text-gray-600">Here are your verbal fluency results</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Semantic Fluency</p>
                  <p className="text-4xl font-bold text-green-600">{semanticScore}</p>
                  <p className="text-xs text-gray-500 mt-2">Category Knowledge</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Phonemic Fluency</p>
                  <p className="text-4xl font-bold text-emerald-600">{phonemicScore}</p>
                  <p className="text-xs text-gray-500 mt-2">Lexical Retrieval</p>
                </div>
                <div className="col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl text-center">
                  <p className="text-sm text-gray-600 mb-2">Overall Score</p>
                  <p className="text-5xl font-bold text-green-600">
                    {Math.round((semanticScore + phonemicScore) / 2)}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">What This Measures:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Semantic Fluency:</strong> Access to semantic memory and category knowledge</li>
                  <li>• <strong>Phonemic Fluency:</strong> Lexical retrieval and phonological processing</li>
                  <li>• <strong>Executive Function:</strong> Strategic search and cognitive flexibility</li>
                  <li>• <strong>Language Processing:</strong> Verbal production and word-finding ability</li>
                </ul>
              </div>

              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
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

export default VerbalFluencyTest
