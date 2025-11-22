import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import * as comparativeAnalyticsController from '../controllers/comparative-analytics.controller'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get comparative analytics for doctor's patients
router.get('/', comparativeAnalyticsController.getComparativeAnalytics)

export default router
