import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const runPrediction = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID is required' });
    }

    // TODO: Implement ML prediction logic
    // For now, return mock data
    res.json({
      patientId,
      riskLabel: 'Low Risk',
      riskProbability: 0.15,
      allProbs: {
        'Low Risk': 0.85,
        'High Risk': 0.15
      },
      modelUsed: 'neurocare_rf_model_v1',
      computedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to run prediction' });
  }
};
