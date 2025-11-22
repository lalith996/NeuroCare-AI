import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

/**
 * Calculate comprehensive risk score for cognitive decline
 */
export const calculateRiskScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientCode } = req.params;

    // Get patient demographics
    const patientResult = await pool.query(
      'SELECT age, sex, education_years FROM neurocare.patients WHERE patient_code = $1',
      [patientCode]
    );

    if (patientResult.rows.length === 0) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const patient = patientResult.rows[0];

    // Get recent scores (last 30 days)
    const scoresResult = await pool.query(
      `SELECT AVG(score) as avg_score, COUNT(*) as game_count, STDDEV(score) as score_variance
       FROM neurocare.game_scores
       WHERE patient_code = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days'`,
      [patientCode]
    );

    const scores = scoresResult.rows[0];

    // Get trajectory trend (last 90 days)
    const trendResult = await pool.query(
      `WITH daily_scores AS (
        SELECT DATE(created_at) as date, AVG(score) as avg_score,
               ROW_NUMBER() OVER (ORDER BY DATE(created_at)) as day_num
        FROM neurocare.game_scores
        WHERE patient_code = $1 AND created_at >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY DATE(created_at)
      )
      SELECT CORR(day_num, avg_score) as trend_correlation FROM daily_scores`,
      [patientCode]
    );

    const trend = trendResult.rows[0]?.trend_correlation || 0;

    // Calculate risk factors
    const riskFactors = {
      age: calculateAgeRisk(patient.age),
      performance: calculatePerformanceRisk(scores.avg_score),
      variability: calculateVariabilityRisk(scores.score_variance),
      decline: calculateDeclineRisk(trend),
      engagement: calculateEngagementRisk(scores.game_count),
    };

    // Weighted risk score
    const totalRisk = Math.round(
      riskFactors.age * 0.25 +
      riskFactors.performance * 0.30 +
      riskFactors.variability * 0.15 +
      riskFactors.decline * 0.25 +
      riskFactors.engagement * 0.05
    );

    // Risk classification
    const riskLevel =
      totalRisk >= 70 ? 'High' :
      totalRisk >= 40 ? 'Medium' :
      'Low';

    // Time-based risk projection (6-month and 1-year)
    const sixMonthRisk = Math.min(100, totalRisk + (trend < -0.5 ? 15 : trend < 0 ? 5 : 0));
    const oneYearRisk = Math.min(100, totalRisk + (trend < -0.5 ? 25 : trend < 0 ? 10 : 0));

    // Recommendations based on risk
    const recommendations = generateRecommendations(riskLevel, riskFactors, patient);

    const response = {
      patientCode,
      currentRisk: {
        score: totalRisk,
        level: riskLevel,
        confidence: calculateConfidence(scores.game_count),
      },
      riskFactors,
      projections: {
        sixMonth: {
          score: sixMonthRisk,
          level: sixMonthRisk >= 70 ? 'High' : sixMonthRisk >= 40 ? 'Medium' : 'Low',
        },
        oneYear: {
          score: oneYearRisk,
          level: oneYearRisk >= 70 ? 'High' : oneYearRisk >= 40 ? 'Medium' : 'Low',
        },
      },
      recommendations,
      assessmentDate: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    console.error('Calculate risk score error:', error);
    res.status(500).json({ error: 'Failed to calculate risk score' });
  }
};

function calculateAgeRisk(age: number): number {
  if (!age) return 30;
  if (age < 60) return 10;
  if (age < 70) return 30;
  if (age < 80) return 50;
  return 70;
}

function calculatePerformanceRisk(avgScore: number): number {
  if (!avgScore) return 50;
  if (avgScore >= 80) return 10;
  if (avgScore >= 60) return 30;
  if (avgScore >= 40) return 60;
  return 80;
}

function calculateVariabilityRisk(variance: number): number {
  if (!variance) return 20;
  if (variance < 10) return 10;
  if (variance < 20) return 30;
  if (variance < 30) return 50;
  return 70;
}

function calculateDeclineRisk(trend: number): number {
  if (trend > 0.3) return 10; // Improving
  if (trend > 0) return 20; // Stable/slightly improving
  if (trend > -0.3) return 40; // Stable/slightly declining
  if (trend > -0.5) return 60; // Declining
  return 80; // Rapidly declining
}

function calculateEngagementRisk(gameCount: number): number {
  if (gameCount >= 20) return 10; // Highly engaged
  if (gameCount >= 10) return 20;
  if (gameCount >= 5) return 40;
  return 60; // Low engagement - concerning
}

function calculateConfidence(gameCount: number): string {
  if (gameCount >= 15) return 'High';
  if (gameCount >= 8) return 'Medium';
  return 'Low';
}

function generateRecommendations(
  riskLevel: string,
  riskFactors: any,
  patient: any
): string[] {
  const recommendations: string[] = [];

  if (riskLevel === 'High') {
    recommendations.push('Schedule comprehensive neuropsychological evaluation');
    recommendations.push('Consider referral to memory clinic or neurologist');
    recommendations.push('Increase assessment frequency to monthly');
  }

  if (riskLevel === 'Medium') {
    recommendations.push('Continue regular cognitive assessments (bi-monthly)');
    recommendations.push('Implement targeted cognitive training program');
  }

  if (riskFactors.performance > 50) {
    recommendations.push('Focus on cognitive exercises targeting weaker domains');
    recommendations.push('Consider cognitive rehabilitation therapy');
  }

  if (riskFactors.decline > 60) {
    recommendations.push('Monitor for rapid cognitive decline');
    recommendations.push('Review medication list for cognitive side effects');
  }

  if (riskFactors.variability > 50) {
    recommendations.push('Assess for delirium or acute medical conditions');
    recommendations.push('Evaluate sleep quality and circadian rhythm');
  }

  if (riskFactors.engagement > 40) {
    recommendations.push('Increase patient engagement through gamification');
    recommendations.push('Assess for depression or motivation issues');
  }

  if (patient.age >= 75) {
    recommendations.push('Ensure adequate social engagement');
    recommendations.push('Promote physical exercise (150min/week)');
  }

  recommendations.push('Encourage Mediterranean diet and cognitive activities');
  recommendations.push('Optimize cardiovascular health management');

  return recommendations;
}

/**
 * Get risk assessment history
 */
export const getRiskHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientCode } = req.params;

    // Get historical predictions
    const result = await pool.query(
      `SELECT * FROM neurocare.predictions
       WHERE patient_code = $1
       ORDER BY computed_at DESC
       LIMIT 10`,
      [patientCode]
    );

    res.json({ history: result.rows });
  } catch (error) {
    console.error('Get risk history error:', error);
    res.status(500).json({ error: 'Failed to fetch risk history' });
  }
};
