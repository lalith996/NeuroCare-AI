import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { Button } from '../ui/button'
import { useToast } from '../ui/use-toast'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'

const AVAILABLE_GAMES = [
  { id: 'memory_match', name: 'Memory Match' },
  { id: 'attention_maze', name: 'Attention Maze' },
  { id: 'focus_puzzle', name: 'Focus Puzzle' },
  { id: 'pattern_match', name: 'Pattern Match' },
  { id: 'reaction_time', name: 'Reaction Time' },
]

export default function GameAssignment({ patientCode }: { patientCode: number }) {
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const assignGamesMutation = useMutation({
    mutationFn: async (games: string[]) => {
      const response = await api.post('/doctor/assign-games', {
        patientCode,
        games,
      })
      return response.data
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Games assigned successfully' })
      queryClient.invalidateQueries({ queryKey: ['patient-games', patientCode] })
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to assign games', variant: 'destructive' })
    },
  })

  const handleToggleGame = (gameId: string) => {
    setSelectedGames((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {AVAILABLE_GAMES.map((game) => (
          <div key={game.id} className="flex items-center space-x-2">
            <Checkbox
              id={game.id}
              checked={selectedGames.includes(game.id)}
              onCheckedChange={() => handleToggleGame(game.id)}
            />
            <Label htmlFor={game.id} className="cursor-pointer">
              {game.name}
            </Label>
          </div>
        ))}
      </div>
      <Button
        onClick={() => assignGamesMutation.mutate(selectedGames)}
        disabled={selectedGames.length === 0 || assignGamesMutation.isPending}
      >
        {assignGamesMutation.isPending ? 'Assigning...' : 'Assign Selected Games'}
      </Button>
    </div>
  )
}
