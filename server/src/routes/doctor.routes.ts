import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as doctorController from '../controllers/doctor.controller';

const router = Router();

// All routes require authentication and doctor role
router.use(authenticate);
router.use(authorize('doctor'));

router.get('/patients', doctorController.getMyPatients);
router.post('/assign-games', doctorController.assignGames);
router.get('/patients/:patientCode/scores', doctorController.getPatientScores);

export default router;
