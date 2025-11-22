import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import db from '../config/database'

export const getComparativeAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user?.id
    const { riskLevel, sortBy = 'risk' } = req.query

    if (!doctorId) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    // Get all patients assigned to this doctor
    const patientsQuery = `
      SELECT
        u.id,
        u.full_name as name,
        u.patient_code,
        u.email,
        u.date_of_birth,
        EXTRACT(YEAR FROM AGE(u.date_of_birth)) as age
      FROM users u
      INNER JOIN doctor_patient_assignments dpa ON u.id = dpa.patient_id
      WHERE dpa.doctor_id = $1
        AND u.role = 'patient'
    `

    const patientsResult = await db.query(patientsQuery, [doctorId])
    const patients = patientsResult.rows

    // For each patient, get their statistics
    const patientsWithStats = await Promise.all(
      patients.map(async (patient) => {
        // Get game statistics
        const statsResult = await db.query(
          `SELECT
            COUNT(*) as total_games,
            AVG(score) as avg_score,
            STDDEV(score) as score_variance,
            MAX(played_at) as last_activity
           FROM game_scores
           WHERE user_id = $1`,
          [patient.id]
        )

        const stats = statsResult.rows[0]

        // Calculate days since last activity
        const daysSinceLastActivity = stats.last_activity
          ? Math.floor(
              (new Date().getTime() - new Date(stats.last_activity).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 999

        // Calculate risk score
        const calculateAgeRisk = (age: number): number => {
          if (age < 50) return 10
          if (age < 60) return 25
          if (age < 70) return 50
          if (age < 80) return 75
          return 90
        }

        const calculatePerformanceRisk = (avgScore: number): number => {
          if (avgScore >= 80) return 10
          if (avgScore >= 60) return 30
          if (avgScore >= 40) return 60
          return 90
        }

        const calculateVariabilityRisk = (variance: number): number => {
          if (variance < 10) return 10
          if (variance < 20) return 30
          if (variance < 30) return 60
          return 90
        }

        const calculateEngagementRisk = (gameCount: number): number => {
          if (gameCount >= 50) return 5
          if (gameCount >= 20) return 15
          if (gameCount >= 10) return 30
          return 60
        }

        // Calculate trend
        const last5GamesResult = await db.query(
          `SELECT score FROM game_scores
           WHERE user_id = $1
           ORDER BY played_at DESC
           LIMIT 5`,
          [patient.id]
        )

        const first5GamesResult = await db.query(
          `SELECT score FROM game_scores
           WHERE user_id = $1
           ORDER BY played_at ASC
           LIMIT 5`,
          [patient.id]
        )

        let trend = 0
        if (last5GamesResult.rows.length >= 5 && first5GamesResult.rows.length >= 5) {
          const recentAvg =
            last5GamesResult.rows.reduce((sum, r) => sum + parseFloat(r.score), 0) / 5
          const initialAvg =
            first5GamesResult.rows.reduce((sum, r) => sum + parseFloat(r.score), 0) / 5
          trend = ((recentAvg - initialAvg) / initialAvg) * 100
        }

        const calculateDeclineRisk = (trend: number): number => {
          if (trend > 10) return 5
          if (trend > 0) return 15
          if (trend > -10) return 40
          if (trend > -20) return 70
          return 95
        }

        const riskFactors = {
          age: calculateAgeRisk(parseInt(patient.age)),
          performance: calculatePerformanceRisk(parseFloat(stats.avg_score) || 50),
          variability: calculateVariabilityRisk(parseFloat(stats.score_variance) || 20),
          decline: calculateDeclineRisk(trend),
          engagement: calculateEngagementRisk(parseInt(stats.total_games) || 0),
        }

        const totalRisk = Math.round(
          riskFactors.age * 0.25 +
            riskFactors.performance * 0.3 +
            riskFactors.variability * 0.15 +
            riskFactors.decline * 0.25 +
            riskFactors.engagement * 0.05
        )

        const riskLevelCalc = totalRisk >= 70 ? 'High' : totalRisk >= 40 ? 'Medium' : 'Low'

        return {
          ...patient,
          total_games: parseInt(stats.total_games) || 0,
          avg_score: Math.round(parseFloat(stats.avg_score) || 0),
          score_variance: parseFloat(stats.score_variance) || 0,
          last_activity: stats.last_activity,
          days_since_last_activity: daysSinceLastActivity,
          risk_score: totalRisk,
          risk_level: riskLevelCalc,
          risk_factors: riskFactors,
          trend: Math.round(trend * 10) / 10,
        }
      })
    )

    // Filter by risk level if specified
    let filteredPatients = patientsWithStats
    if (riskLevel && riskLevel !== 'all') {
      filteredPatients = patientsWithStats.filter((p) => p.risk_level === riskLevel)
    }

    // Sort patients
    const sortedPatients = filteredPatients.sort((a, b) => {
      switch (sortBy) {
        case 'risk':
          return b.risk_score - a.risk_score
        case 'performance':
          return b.avg_score - a.avg_score
        case 'engagement':
          return b.total_games - a.total_games
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return b.risk_score - a.risk_score
      }
    })

    res.json({
      success: true,
      patients: sortedPatients,
      summary: {
        total: sortedPatients.length,
        highRisk: sortedPatients.filter((p) => p.risk_level === 'High').length,
        mediumRisk: sortedPatients.filter((p) => p.risk_level === 'Medium').length,
        lowRisk: sortedPatients.filter((p) => p.risk_level === 'Low').length,
        avgScore: Math.round(
          sortedPatients.reduce((sum, p) => sum + p.avg_score, 0) / sortedPatients.length || 0
        ),
      },
    })
  } catch (error) {
    console.error('Error fetching comparative analytics:', error)
    res.status(500).json({ error: 'Failed to fetch comparative analytics' })
  }
}
