import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

/**
 * Get patient progress over time with trend analysis
 */
export const getPatientProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientCode } = req.params;
    const { days = 30 } = req.query;

    // Get score history
    const scoresQuery = `
      SELECT
        DATE(created_at) as date,
        game,
        AVG(score) as avg_score,
        COUNT(*) as games_played
      FROM neurocare.game_scores
      WHERE patient_code = $1
        AND created_at >= CURRENT_DATE - INTERVAL '${parseInt(days as string)} days'
      GROUP BY DATE(created_at), game
      ORDER BY date DESC
    `;

    const scores = await pool.query(scoresQuery, [patientCode]);

    // Get overall statistics
    const statsQuery = `
      SELECT
        COUNT(DISTINCT game) as unique_games,
        COUNT(*) as total_games,
        AVG(score) as overall_avg_score,
        MAX(score) as best_score,
        MIN(score) as lowest_score
      FROM neurocare.game_scores
      WHERE patient_code = $1
        AND created_at >= CURRENT_DATE - INTERVAL '${parseInt(days as string)} days'
    `;

    const stats = await pool.query(statsQuery, [patientCode]);

    // Calculate improvement trend
    const trendQuery = `
      WITH daily_scores AS (
        SELECT
          DATE(created_at) as date,
          AVG(score) as avg_score,
          ROW_NUMBER() OVER (ORDER BY DATE(created_at)) as day_num
        FROM neurocare.game_scores
        WHERE patient_code = $1
          AND created_at >= CURRENT_DATE - INTERVAL '${parseInt(days as string)} days'
        GROUP BY DATE(created_at)
      )
      SELECT
        CORR(day_num, avg_score) as trend_correlation,
        (SELECT avg_score FROM daily_scores ORDER BY date LIMIT 1) as first_avg,
        (SELECT avg_score FROM daily_scores ORDER BY date DESC LIMIT 1) as last_avg
      FROM daily_scores
    `;

    const trend = await pool.query(trendQuery, [patientCode]);

    // Get game-specific breakdown
    const gameBreakdownQuery = `
      SELECT
        game,
        COUNT(*) as attempts,
        AVG(score) as avg_score,
        MAX(score) as best_score,
        STDDEV(score) as score_variance
      FROM neurocare.game_scores
      WHERE patient_code = $1
        AND created_at >= CURRENT_DATE - INTERVAL '${parseInt(days as string)} days'
      GROUP BY game
      ORDER BY avg_score DESC
    `;

    const gameBreakdown = await pool.query(gameBreakdownQuery, [patientCode]);

    res.json({
      scoreHistory: scores.rows,
      statistics: stats.rows[0] || {},
      trend: {
        correlation: trend.rows[0]?.trend_correlation || 0,
        improvement: trend.rows[0]
          ? ((trend.rows[0].last_avg - trend.rows[0].first_avg) / trend.rows[0].first_avg) * 100
          : 0,
      },
      gameBreakdown: gameBreakdown.rows,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
};

/**
 * Create progress snapshot for a patient
 */
export const createProgressSnapshot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientCode } = req.params;
    const { notes } = req.body;

    // Calculate current metrics
    const metricsQuery = `
      SELECT
        AVG(score) as average_score,
        COUNT(*) as games_completed,
        jsonb_object_agg(game, avg_score) as cognitive_domains
      FROM (
        SELECT game, AVG(score) as avg_score
        FROM neurocare.game_scores
        WHERE patient_code = $1
          AND created_at >= CURRENT_DATE - INTERVAL '7 days'
        GROUP BY game
      ) game_averages
    `;

    const metrics = await pool.query(metricsQuery, [patientCode]);

    // Calculate improvement rate
    const improvementQuery = `
      WITH week_comparison AS (
        SELECT
          AVG(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN score END) as current_week,
          AVG(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '14 days'
                   AND created_at < CURRENT_DATE - INTERVAL '7 days' THEN score END) as previous_week
        FROM neurocare.game_scores
        WHERE patient_code = $1
      )
      SELECT
        CASE
          WHEN previous_week > 0 THEN ((current_week - previous_week) / previous_week) * 100
          ELSE 0
        END as improvement_rate
      FROM week_comparison
    `;

    const improvement = await pool.query(improvementQuery, [patientCode]);

    // Insert snapshot
    const result = await pool.query(
      `INSERT INTO neurocare.progress_snapshots
       (patient_code, snapshot_date, average_score, games_completed, improvement_rate, cognitive_domains, notes)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6)
       ON CONFLICT (patient_code, snapshot_date)
       DO UPDATE SET
         average_score = $2,
         games_completed = $3,
         improvement_rate = $4,
         cognitive_domains = $5,
         notes = $6,
         created_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        patientCode,
        metrics.rows[0]?.average_score || 0,
        metrics.rows[0]?.games_completed || 0,
        improvement.rows[0]?.improvement_rate || 0,
        metrics.rows[0]?.cognitive_domains || {},
        notes || '',
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create snapshot error:', error);
    res.status(500).json({ error: 'Failed to create progress snapshot' });
  }
};

/**
 * Get all progress snapshots for a patient
 */
export const getProgressSnapshots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientCode } = req.params;

    const result = await pool.query(
      `SELECT * FROM neurocare.progress_snapshots
       WHERE patient_code = $1
       ORDER BY snapshot_date DESC
       LIMIT 90`,
      [patientCode]
    );

    res.json({ snapshots: result.rows });
  } catch (error) {
    console.error('Get snapshots error:', error);
    res.status(500).json({ error: 'Failed to fetch progress snapshots' });
  }
};

/**
 * Get comparative analytics for all patients (for doctors)
 */
export const getComparativeAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user!.id;

    const query = `
      SELECT
        p.patient_code,
        p.age,
        p.sex,
        p.education_years,
        COUNT(DISTINCT gs.game) as unique_games_played,
        COUNT(gs.id) as total_games,
        AVG(gs.score) as average_score,
        MAX(gs.score) as best_score,
        MAX(gs.created_at) as last_activity,
        (
          SELECT risk_label
          FROM neurocare.predictions
          WHERE patient_code = p.patient_code
          ORDER BY computed_at DESC
          LIMIT 1
        ) as risk_level
      FROM neurocare.patients p
      LEFT JOIN neurocare.game_scores gs ON p.patient_code = gs.patient_code
      WHERE EXISTS (
        SELECT 1 FROM neurocare.game_assignments ga
        WHERE ga.patient_code = p.patient_code
          AND ga.doctor_id = $1
      )
      GROUP BY p.patient_code, p.age, p.sex, p.education_years
      ORDER BY average_score DESC
    `;

    const result = await pool.query(query, [doctorId]);

    res.json({ patients: result.rows });
  } catch (error) {
    console.error('Get comparative analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch comparative analytics' });
  }
};
