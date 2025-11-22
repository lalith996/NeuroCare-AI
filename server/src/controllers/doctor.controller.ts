import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getMyPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user!.id;

    const result = await pool.query(
      `SELECT p.id, p.patient_code, p.age, p.sex, p.education_years, u.email, u.full_name
       FROM patients p
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1
       ORDER BY p.patient_code`,
      [doctorId]
    );

    res.json({ patients: result.rows });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
};

export const assignGames = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctorId = req.user!.id;
    const { patientCode, games } = req.body;

    if (!patientCode || !games || !Array.isArray(games)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Verify patient belongs to this doctor
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE patient_code = $1 AND user_id = $2',
      [patientCode, doctorId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found or not assigned to you' });
    }

    // Delete existing assignments
    await pool.query(
      'DELETE FROM game_assignments WHERE patient_code = $1',
      [patientCode]
    );

    // Insert new assignments
    const insertPromises = games.map(game =>
      pool.query(
        'INSERT INTO game_assignments (patient_code, doctor_id, game_name, status) VALUES ($1, $2, $3, $4)',
        [patientCode, doctorId, game, 'assigned']
      )
    );

    await Promise.all(insertPromises);

    res.json({
      message: 'Games assigned successfully',
      patientCode,
      games
    });
  } catch (error) {
    console.error('Assign games error:', error);
    res.status(500).json({ error: 'Failed to assign games' });
  }
};

export const getPatientScores = async (req: AuthRequest, res: Response): Promise<void> => {
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
      `SELECT id, game, level, score, attempt, metrics, session_id, 
              timestamp_start, timestamp_end, device, created_at
       FROM game_scores
       WHERE patient_code = $1
       ORDER BY created_at DESC`,
      [patientCode]
    );

    // Get latest prediction
    const predictionResult = await pool.query(
      `SELECT id, risk_label, risk_probability, model_version, computed_at, 
              feature_importance, input_summary
       FROM predictions
       WHERE patient_code = $1
       ORDER BY computed_at DESC
       LIMIT 1`,
      [patientCode]
    );

    res.json({
      patientCode,
      scores: scoresResult.rows,
      prediction: predictionResult.rows[0] || null
    });
  } catch (error) {
    console.error('Get patient scores error:', error);
    res.status(500).json({ error: 'Failed to fetch patient scores' });
  }
};
