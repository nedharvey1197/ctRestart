const neo4j = require('neo4j-driver');
const logger = require('../utils/logger');

class TrialGraphService {
  constructor(driver) {
    this.driver = driver;
  }

  async createTrialNode(trial) {
    const session = this.driver.session();
    try {
      await session.writeTransaction(async tx => {
        await tx.run(
          `
          CREATE (t:Trial {
            id: $id,
            trialId: $trialId,
            therapeuticArea: $therapeuticArea,
            phase: $phase
          })
          `,
          {
            id: trial._id.toString(),
            trialId: trial.trialId,
            therapeuticArea: trial.therapeuticArea,
            phase: trial.phase
          }
        );
      });
      logger.info(`Created trial node for ${trial.trialId}`);
    } catch (error) {
      logger.error('Error creating trial node:', error);
      throw error;
    } finally {
      await session.close();
    }
  }

  async findRelatedTrials(trialId) {
    const session = this.driver.session();
    try {
      const result = await session.readTransaction(async tx => {
        return await tx.run(
          `
          MATCH (t:Trial {trialId: $trialId})-[r]-(related)
          RETURN related
          `,
          { trialId }
        );
      });
      return result.records.map(record => record.get('related').properties);
    } catch (error) {
      logger.error('Error finding related trials:', error);
      throw error;
    } finally {
      await session.close();
    }
  }
}

module.exports = TrialGraphService; 