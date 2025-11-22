import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAssignedGames = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get patient record
    const patientResult = await pool.query(
      'SELECT id, patient_code FROM patients WHERE user_id = $1',
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const patient = patientResult.rows[0];

    // Get assigned games
    const gamesResult = await pool.query(
      `SELECT id, game_name, status, assigned_at
       FROM game_assignments
       WHERE patient_code = $1
       ORDER BY assigned_at DESC`,
      [patient.patient_code]
    );

    res.json({
      patientCode: patient.patient_code,
      games: gamesResult.rows
    });
  } catch (error) {
    console.error('Get assigned games error:', error);
    res.status(500).json({ error: 'Failed to fetch assigned games' });
  }
};

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement file upload with multer
    res.status(501).json({ error: 'Document upload not yet implemented' });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const patientResult = await pool.query(
      'SELECT patient_code FROM patients WHERE user_id = $1',
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const patientCode = patientResult.rows[0].patient_code;

    const documentsResult = await pool.query(
      `SELECT id, document_type, file_name, uploaded_at
       FROM medical_documents
       WHERE patient_code = $1
       ORDER BY uploaded_at DESC`,
      [patientCode]
    );

    res.json({ documents: documentsResult.rows });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};
