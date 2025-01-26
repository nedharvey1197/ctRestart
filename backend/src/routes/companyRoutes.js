const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { validateCompany, validateObjectId } = require('../middleware/validation');

// Get current company (should be first to avoid ID conflict)
router.get('/current', companyController.getCurrentCompany);

// Get specific company by ID
router.get('/:id', validateObjectId, companyController.getCompany);

// Reset company data
router.post('/reset', companyController.resetCompany);

// Standard CRUD routes
router.post('/', validateCompany, companyController.createCompany);
router.put('/:id', validateObjectId, companyController.updateCompany);

// Add this route for testing
router.get('/test/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ message: 'Test route working', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 