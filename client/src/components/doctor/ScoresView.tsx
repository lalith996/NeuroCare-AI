export default function ScoresView({ scores, prediction }: any) {
  if (!scores || scores.length === 0) {
    return <p className="text-sm text-muted-foreground">No scores recorded yet</p>
  }

  const gameStats = scores.reduce((acc: any, score: any) => {
    if (!acc[score.game]) {
      acc[score.game] = { total: 0, count: 0, maxLevel: 0 }
    }
    acc[score.game].total += score.score
    acc[score.game].count += 1
    acc[score.game].maxLevel = Math.max(acc[score.game].maxLevel, score.level || 0)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(gameStats).map(([game, stats]: [string, any]) => (
        <div key={game} className="p-4 rounded-lg bg-accent">
          <h4 className="font-medium mb-2">{game.replace(/_/g, ' ').toUpperCase()}</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Attempts</p>
              <p className="font-semibold">{stats.count}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Score</p>
              <p className="font-semibold">{(stats.total / stats.count).toFixed(1)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Max Level</p>
              <p className="font-semibold">{stats.maxLevel}</p>
            </div>
          </div>
        </div>
      ))}

      {prediction && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <h4 className="font-medium mb-2">Latest Prediction</h4>
          <p className="text-sm">
            <span className="font-semibold">Risk Level:</span> {prediction.risk_label}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Confidence:</span>{' '}
            {(prediction.risk_probability * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  )
}
