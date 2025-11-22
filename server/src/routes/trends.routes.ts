import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import * as trendsController from '../controllers/trends.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get longitudinal trends for a patient
router.get('/:patientCode', trendsController.getTrends)

// Get domain-specific trends
router.get('/:patientCode/domains', trendsController.getDomainTrends)

export default router
