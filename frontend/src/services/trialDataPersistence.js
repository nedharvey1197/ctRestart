import { TrialAnalysisError } from '../utils/errorHandler';

export class TrialDataPersistence {
  static async initDatabase() {
    // Add IndexedDB initialization
    const request = indexedDB.open('trialAnalysis', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('trialData')) {
        db.createObjectStore('trialData');
      }
    };

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  static async getDatabase() {
    if (!this.db) {
      this.db = await this.initDatabase();
    }
    return this.db;
  }

  static async saveTrialData(companyId, trialData) {
    try {
      const key = `trialData_${companyId}`;
      localStorage.setItem(key, JSON.stringify(trialData));
      
      const db = await this.getDatabase();
      const tx = db.transaction('trialData', 'readwrite');
      await tx.store.put(trialData, companyId);
      
      return true;
    } catch (error) {
      throw new TrialAnalysisError('Failed to persist trial data', 'PERSISTENCE_ERROR', error);
    }
  }

  static async getTrialData(companyId) {
    try {
      // Try localStorage first
      const localData = localStorage.getItem(`trialData_${companyId}`);
      if (localData) {
        return JSON.parse(localData);
      }

      // Fall back to IndexedDB
      const db = await this.getDatabase();
      const tx = db.transaction('trialData', 'readonly');
      const data = await tx.store.get(companyId);
      
      return data;
    } catch (error) {
      throw new TrialAnalysisError('Failed to retrieve trial data', 'RETRIEVAL_ERROR', error);
    }
  }

  // Add cleanup method
  static async cleanup() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  // Add batch operation method
  static async batchSaveTrialData(trialDataArray) {
    try {
      const db = await this.getDatabase();
      const tx = db.transaction('trialData', 'readwrite');
      
      const promises = trialDataArray.map(({ companyId, data }) => {
        const key = `trialData_${companyId}`;
        localStorage.setItem(key, JSON.stringify(data));
        return tx.store.put(data, companyId);
      });

      await Promise.all(promises);
      return true;
    } catch (error) {
      throw new TrialAnalysisError('Failed to batch save trial data', 'BATCH_SAVE_ERROR', error);
    }
  }

  // Add data validation method
  static validateTrialData(trialData) {
    const required = ['studies', 'analytics', 'queryDate'];
    const missing = required.filter(field => !trialData[field]);
    
    if (missing.length) {
      throw new TrialAnalysisError(
        'Invalid trial data structure', 
        'VALIDATION_ERROR', 
        { missingFields: missing }
      );
    }
    return true;
  }
} 