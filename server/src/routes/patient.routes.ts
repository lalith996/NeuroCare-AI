import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as patientController from '../controllers/patient.controller';

const router = Router();

router.use(authenticate);
router.use(authorize('patient'));

router.get('/games', patientController.getAssignedGames);
router.post('/upload-document', patientController.uploadDocument);
router.get('/documents', patientController.getDocuments);

export default router;
