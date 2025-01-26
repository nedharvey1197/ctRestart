const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateObjectId = [
  param('id')
    .custom(value => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ID format');
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const trialValidation = [
  body('trialId').trim().matches(/^NCT\d{8}$/).withMessage('Invalid trial ID format'),
  body('therapeuticArea').trim().notEmpty().escape(),
  body('phase').isIn(['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4']),
  param('companyId').custom(validateObjectId).withMessage('Invalid company ID'),
  handleValidationErrors
];

const companyValidation = [
  body('companyName').trim().notEmpty().escape(),
  body('companyWebsite').optional().isURL(),
  handleValidationErrors
];

const validateCompany = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  
  body('companyWebsite')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  
  body('contactEmail')
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),
  
  body('companySize')
    .optional()
    .isIn(['Small (<50 employees)', 'Medium (50-250 employees)', 'Large (251-1000 employees)', 'Enterprise (1000+ employees)'])
    .withMessage('Invalid company size'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateEnrichmentRequest = [
  param('id')
    .isMongoId()
    .withMessage('Invalid company ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  trialValidation,
  companyValidation,
  validateObjectId,
  validateCompany,
  validationResult
}; 