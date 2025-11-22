import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

const generateReportContent = (patientCode: number, scores: any[], prediction: any): string => {
  const gameSummary: any = {};
  
  scores.forEach(score => {
    if (!gameSummary[score.game]) {
      gameSummary[score.game] = {
        totalAttempts: 0,
        avgScore: 0,
        maxLevel: 0,
        scores: []
      };
    }
    gameSummary[score.game].totalAttempts++;
    gameSummary[score.game].scores.push(score.score);
    gameSummary[score.game].maxLevel = Math.max(gameSummary[score.game].maxLevel, score.level || 0);
  });

  Object.keys(gameSummary).forEach(game => {
    const scores = gameSummary[game].scores;
    gameSummary[game].avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
  });

  const riskLabel = prediction?.risk_label || 'Not computed';
  const riskProb = prediction?.risk_probability || 0;

  let report = `# Cognitive Assessment Report - Patient #${patientCode}\n\n`;
  report += `## Summary\n`;
  report += `Based on your performance across multiple cognitive games, our AI system has analyzed your results.\n\n`;
  report += `## Your Performance\n\n`;

  Object.entries(gameSummary).forEach(([game, stats]: [string, any]) => {
    report += `### ${game.replace(/_/g, ' ').toUpperCase()}\n`;
    report += `- Games Played: ${stats.totalAttempts}\n`;
    report += `- Average Score: ${stats.avgScore.toFixed(1)}\n`;
    report += `- Highest Level Reached: ${stats.maxLevel}\n\n`;
  });

  report += `## Assessment Result\n\n`;
  report += `**Risk Level:** ${riskLabel}\n`;
  report += `**Confidence:** ${(riskProb * 100).toFixed(1)}%\n\n`;

  if (riskLabel.toLowerCase().includes('high') || riskLabel.toLowerCase().includes('mci')) {
    report += `### What This Means\n`;
    report += `Your cognitive assessment shows patterns that may require further medical evaluation.\n\n`;
    report += `### Next Steps\n`;
    report += `1. Schedule a follow-up appointment with your doctor\n`;
    report += `2. Discuss these results in detail\n`;
    report += `3. Your doctor may recommend additional clinical assessments\n\n`;
  } else {
    report += `### What This Means\n`;
    report += `Your cognitive assessment shows healthy performance patterns.\n\n`;
    report += `### Recommendations\n`;
    report += `1. Continue playing cognitive games regularly\n`;
    report += `2. Maintain a healthy lifestyle\n`;
    report += `3. Schedule regular check-ups with your doctor\n\n`;
  }

  return report;
};

export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user!.id;
    const { patientCode } = req.params;

    // Verify patient belongs to this doctor
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE patient_code = $1 AND user_id = $2',
      [patientCode, doctorId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }

    // Get scores
    const scoresResult = await pool.query(
      'SELECT game, level, score, created_at FROM game_scores WHERE patient_code = $1',
      [patientCode]
    );

    if (scoresResult.rows.length === 0) {
      return res.status(400).json({ error: 'No scores available for this patient' });
    }

    // Get latest prediction
    const predictionResult = await pool.query(
      'SELECT risk_label, risk_probability FROM predictions WHERE patient_code = $1 ORDER BY computed_at DESC LIMIT 1',
      [patientCode]
    );

    const prediction = predictionResult.rows[0] || null;
    const reportContent = generateReportContent(parseInt(patientCode), scoresResult.rows, prediction);

    // Save report
    const reportResult = await pool.query(
      `INSERT INTO patient_reports (patient_code, doctor_id, report_content, prediction_summary)
       VALUES ($1, $2, $3, $4)
       RETURNING id, generated_at`,
      [patientCode, doctorId, reportContent, JSON.stringify(prediction)]
    );

    res.json({
      message: 'Report generated successfully',
      reportId: reportResult.rows[0].id,
      reportContent,
      generatedAt: reportResult.rows[0].generated_at
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

export const getLatestReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { patientCode } = req.params;

    // Verify access
    const accessCheck = await pool.query(
      'SELECT id FROM patients WHERE patient_code = $1 AND user_id = $2',
      [patientCode, userId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reportResult = await pool.query(
      `SELECT id, report_content, generated_at
       FROM patient_reports
       WHERE patient_code = $1
       ORDER BY generated_at DESC
       LIMIT 1`,
      [patientCode]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'No report found' });
    }

    res.json(reportResult.rows[0]);
  } catch (error) {
    console.error('Get latest report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};
