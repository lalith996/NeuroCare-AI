'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Trophy, Timer, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import { scoresAPI, gamificationAPI } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'

const EMOJIS = ['🧠', '🎮', '🏆', '⭐', '🔥', '💡', '🎯', '🚀']

interface CardType {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

export function MemoryMatchGame() {
  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const { toast } = useToast()

  // Initialize game
  const initializeGame = () => {
    const gameEmojis = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
    setCards(gameEmojis)
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setTimer(0)
    setIsPlaying(true)
    setIsComplete(false)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isPlaying && !isComplete) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, isComplete])

  // Handle card click
  const handleCardClick = (id: number) => {
    if (!isPlaying || flippedCards.length === 2 || cards[id].isMatched) return

    const newCards = [...cards]
    newCards[id].isFlipped = true
    setCards(newCards)

    const newFlippedCards = [...flippedCards, id]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)

      const [firstId, secondId] = newFlippedCards
      if (cards[firstId].emoji === cards[secondId].emoji) {
        // Match found!
        setTimeout(() => {
          const matchedCards = [...cards]
          matchedCards[firstId].isMatched = true
          matchedCards[secondId].isMatched = true
          setCards(matchedCards)
          setMatches((prev) => prev + 1)
          setFlippedCards([])

          // Check if game complete
          if (matches + 1 === EMOJIS.length) {
            handleGameComplete()
          }
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          const unflippedCards = [...cards]
          unflippedCards[firstId].isFlipped = false
          unflippedCards[secondId].isFlipped = false
          setCards(unflippedCards)
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  // Handle game completion
  const handleGameComplete = async () => {
    setIsComplete(true)
    setIsPlaying(false)

    // Calculate score (based on moves and time)
    const perfectMoves = EMOJIS.length
    const moveScore = Math.max(0, 100 - (moves - perfectMoves) * 5)
    const timeScore = Math.max(0, 100 - Math.floor(timer / 2))
    const finalScore = Math.round((moveScore + timeScore) / 2)

    try {
      // Submit score
      await scoresAPI.submitScore({
        gameId: 1, // Memory Match game ID
        score: finalScore,
        timeTaken: timer,
        metadata: { moves, matches: EMOJIS.length },
      })

      // Update streak and check achievements
      await gamificationAPI.updateStreak()
      await gamificationAPI.checkAchievements()

      toast({
        title: 'Game Complete! 🎉',
        description: `Score: ${finalScore}/100 | Time: ${timer}s | Moves: ${moves}`,
      })
    } catch (error) {
      console.error('Error submitting score:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Memory Match
            </CardTitle>
            <CardDescription>Match all pairs to complete the game</CardDescription>
          </div>
          {!isPlaying && !isComplete && (
            <Button onClick={initializeGame}>Start Game</Button>
          )}
          {(isPlaying || isComplete) && (
            <Button variant="outline" onClick={initializeGame}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats */}
        {(isPlaying || isComplete) && (
          <div className="flex gap-4 justify-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Timer className="w-4 h-4 mr-2" />
              {formatTime(timer)}
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Moves: {moves}
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              {matches}/{EMOJIS.length}
            </Badge>
          </div>
        )}

        {/* Game Board */}
        {cards.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => handleCardClick(card.id)}
                  disabled={!isPlaying || card.isMatched}
                  className={`
                    w-full aspect-square rounded-lg text-5xl
                    flex items-center justify-center
                    transition-all duration-300
                    ${
                      card.isFlipped || card.isMatched
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80'
                    }
                    ${card.isMatched ? 'opacity-50' : ''}
                    disabled:cursor-not-allowed
                  `}
                >
                  {card.isFlipped || card.isMatched ? card.emoji : '?'}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Ready to play?</h3>
            <p className="text-muted-foreground">Click Start Game to begin</p>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4 bg-primary/10 rounded-lg"
          >
            <Trophy className="w-12 h-12 mx-auto text-primary mb-2" />
            <h3 className="text-xl font-bold">Congratulations!</h3>
            <p className="text-muted-foreground">
              You completed the game in {moves} moves and {formatTime(timer)}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
