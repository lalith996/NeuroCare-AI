import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import db from '../config/database'

export const getTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientCode } = req.params
    const { days = 30 } = req.query

    // Get patient
    const patientResult = await db.query(
      'SELECT id FROM users WHERE patient_code = $1',
      [patientCode]
    )

    if (patientResult.rows.length === 0) {
      res.status(404).json({ error: 'Patient not found' })
      return
    }

    const userId = patientResult.rows[0].id

    // Get scores for the specified time period
    const scoresResult = await db.query(
      `SELECT
        game_type,
        score,
        played_at,
        performance_data
       FROM game_scores
       WHERE user_id = $1
         AND played_at >= NOW() - INTERVAL '1 day' * $2
       ORDER BY played_at ASC`,
      [userId, days]
    )

    // Get overall statistics
    const statsResult = await db.query(
      `SELECT
        COUNT(*) as total_games,
        AVG(score) as avg_score,
        MIN(score) as min_score,
        MAX(score) as max_score,
        STDDEV(score) as score_variance
       FROM game_scores
       WHERE user_id = $1`,
      [userId]
    )

    const statistics = {
      total_games: parseInt(statsResult.rows[0].total_games) || 0,
      avg_score: Math.round(parseFloat(statsResult.rows[0].avg_score) || 0),
      min_score: parseFloat(statsResult.rows[0].min_score) || 0,
      max_score: parseFloat(statsResult.rows[0].max_score) || 0,
      score_variance: parseFloat(statsResult.rows[0].score_variance) || 0,
    }

    res.json({
      success: true,
      scores: scoresResult.rows,
      statistics,
    })

  } catch (error) {
    console.error('Error fetching trends:', error)
    res.status(500).json({ error: 'Failed to fetch trends' })
  }
}

export const getDomainTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientCode } = req.params

    // Get patient
    const patientResult = await db.query(
      'SELECT id FROM users WHERE patient_code = $1',
      [patientCode]
    )

    if (patientResult.rows.length === 0) {
      res.status(404).json({ error: 'Patient not found' })
      return
    }

    const userId = patientResult.rows[0].id

    // Domain mapping
    const domains = {
      memory: ['memory_match', 'pattern_recognition'],
      attention: ['stroop_test', 'pattern_recognition'],
      working_memory: ['n_back'],
      processing_speed: ['reaction_time', 'trail_making_test'],
      executive_function: ['stroop_test', 'trail_making_test', 'verbal_fluency'],
      language: ['verbal_fluency'],
    }

    const domainTrends: any = {}

    // Calculate trends for each domain
    for (const [domain, gameTypes] of Object.entries(domains)) {
      const domainScoresResult = await db.query(
        `SELECT score, played_at
         FROM game_scores
         WHERE user_id = $1
           AND game_type = ANY($2)
         ORDER BY played_at ASC`,
        [userId, gameTypes]
      )

      if (domainScoresResult.rows.length > 0) {
        const scores = domainScoresResult.rows
        const avgScore = scores.reduce((sum, s) => sum + parseFloat(s.score), 0) / scores.length

        // Calculate trend (last 5 vs previous 5)
        const recent = scores.slice(-5)
        const previous = scores.slice(-10, -5)

        let trend = 0
        if (recent.length > 0 && previous.length > 0) {
          const recentAvg = recent.reduce((sum, s) => sum + parseFloat(s.score), 0) / recent.length
          const previousAvg = previous.reduce((sum, s) => sum + parseFloat(s.score), 0) / previous.length
          trend = ((recentAvg - previousAvg) / previousAvg) * 100
        }

        domainTrends[domain] = {
          avgScore: Math.round(avgScore),
          trend: Math.round(trend * 10) / 10,
          dataPoints: scores.length,
          scores: scores.map(s => ({
            score: parseFloat(s.score),
            date: s.played_at,
          })),
        }
      }
    }

    res.json({
      success: true,
      domains: domainTrends,
    })

  } catch (error) {
    console.error('Error fetching domain trends:', error)
    res.status(500).json({ error: 'Failed to fetch domain trends' })
  }
}
