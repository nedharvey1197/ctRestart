/**
 * @fileoverview Component Integration Service
 * 
 * Manages component communication and data flow between
 * different parts of the application. Handles state synchronization
 * and event propagation.
 * 
 * @integration
 * - Component lifecycle management
 * - State synchronization
 * - Event handling
 * - Data flow control
 */

export class ComponentIntegrationService {
  static subscriptions = new Map();

  static async updateRelatedComponents(companyId, trialData) {
    // Notify all related components about data updates
    const event = new CustomEvent('trialDataUpdate', {
      detail: { companyId, trialData }
    });
    window.dispatchEvent(event);
    
    // Notify specific component subscribers
    const subscribers = this.subscriptions.get(companyId) || [];
    subscribers.forEach(callback => callback(trialData));
  }

  static subscribeToUpdates(componentId, companyId, callback) {
    if (!this.subscriptions.has(companyId)) {
      this.subscriptions.set(companyId, new Set());
    }
    this.subscriptions.get(companyId).add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(companyId);
      if (subs) {
        subs.delete(callback);
      }
    };
  }
} 