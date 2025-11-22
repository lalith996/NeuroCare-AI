import { Router } from 'express';
import * as scoreController from '../controllers/score.controller';

const router = Router();

router.post('/', scoreController.submitScore);

export default router;
