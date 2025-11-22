import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as predictionController from '../controllers/prediction.controller';

const router = Router();

router.use(authenticate);

router.post('/', predictionController.runPrediction);

export default router;
