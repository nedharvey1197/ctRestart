const express = require('express');
const trialController = require('../controllers/trialController');
const { trialValidation } = require('../middleware/validation');

const router = express.Router();

router.post('/:companyId', trialValidation, trialController.createTrial);
router.get('/company/:companyId', trialController.getTrialsByCompany);
router.get('/:id', trialController.getTrial);
router.put('/:id', trialValidation, trialController.updateTrial);

module.exports = router; 