import { Request, Response } from 'express';
import pool from '../config/database';

export const submitScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      sessionId,
      game,
      level,
      score,
      metrics,
      timestampStart,
      timestampEnd,
      device,
      attempt = 1
    } = req.body;

    if (!patientId || !game || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO game_scores 
       (patient_code, session_id, game, level, attempt, score, metrics, 
        timestamp_start, timestamp_end, device)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id`,
      [
        patientId,
        sessionId,
        game,
        level,
        attempt,
        score,
        JSON.stringify(metrics || {}),
        timestampStart,
        timestampEnd,
        device
      ]
    );

    res.status(201).json({
      message: 'Score submitted successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Submit score error:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
};
