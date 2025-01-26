const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const enrichmentController = require('../controllers/enrichmentController');

// Debug logging
console.log('Setting up main router');

// Company routes
router.get('/companies/current', companyController.getCurrentCompany);
router.get('/companies/:id', companyController.getCompany);
router.post('/companies', companyController.createCompany);
router.put('/companies/:id', companyController.updateCompany);
router.post('/companies/reset', companyController.resetCompany);
router.delete('/companies/:id', companyController.deleteCompany);
router.post('/companies/:id/trials', companyController.saveTrialAnalysis);

module.exports = router; 