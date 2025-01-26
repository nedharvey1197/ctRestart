const fs = require('fs').promises;
const path = require('path');

const filesToRemove = [
  'frontend/src/components/ClinicalTrials.jsx',
  'frontend/src/services/enrichmentService.js',
  'frontend/src/utils/oldTrialHelpers.js',
  'backend/src/services/clinicalTrialsService.js'
];

const filesToUpdate = [
  {
    path: 'backend/src/controllers/enrichmentController.js',
    removals: [
      'clinicalTrialsService',
      'handleTrialEnrichment'
    ]
  }
];

async function cleanup() {
  try {
    // Remove deprecated files
    for (const file of filesToRemove) {
      await fs.unlink(path.resolve(file))
        .catch(err => console.log(`Warning: ${file} already removed`));
    }

    // Update files with removals
    for (const file of filesToUpdate) {
      const content = await fs.readFile(file.path, 'utf8');
      let updatedContent = content;
      
      for (const removal of file.removals) {
        const regex = new RegExp(`.*${removal}.*\\n`, 'g');
        updatedContent = updatedContent.replace(regex, '');
      }

      await fs.writeFile(file.path, updatedContent);
    }

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}

cleanup(); 