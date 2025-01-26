const express = require('express');
const companyController = require('../controllers/companyController');
const router = express.Router();

// Core company routes
router.get('/companies/:id', companyController.getCompany);
router.post('/companies', companyController.createCompany);
router.put('/companies/:id', companyController.updateCompany);
router.delete('/companies/:id', companyController.deleteCompany);

// Trial analysis routes
router.post('/companies/:id/trials', companyController.saveTrialAnalysis);
// router.post('/companies/:id/analysis', companyController.saveTrialAnalysis);  // New endpoint

// Utility routes
router.get('/companies/current', companyController.getCurrentCompany);
router.post('/companies/reset', companyController.resetCompany);

module.exports = router; 