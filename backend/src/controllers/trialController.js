const Trial = require('../models/Trial');
const logger = require('../utils/logger');

exports.createTrial = async (req, res) => {
  try {
    const trial = new Trial({
      ...req.body,
      companyId: req.params.companyId
    });
    await trial.save();
    res.status(201).json(trial);
  } catch (error) {
    logger.error('Error creating trial:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getTrialsByCompany = async (req, res) => {
  try {
    const trials = await Trial.find({ companyId: req.params.companyId });
    res.json(trials);
  } catch (error) {
    logger.error('Error getting trials:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateTrial = async (req, res) => {
  try {
    const trial = await Trial.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!trial) {
      return res.status(404).json({ error: 'Trial not found' });
    }
    res.json(trial);
  } catch (error) {
    logger.error('Error updating trial:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getTrial = async (req, res) => {
  try {
    const trial = await Trial.findById(req.params.id);
    if (!trial) {
      return res.status(404).json({ error: 'Trial not found' });
    }
    res.json(trial);
  } catch (error) {
    logger.error('Error getting trial:', error);
    res.status(400).json({ error: error.message });
  }
}; 