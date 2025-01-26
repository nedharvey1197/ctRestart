export class LoadingStateManager {
  constructor() {
    this.states = new Map();
    this.observers = new Set();
  }

  addObserver(callback) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  notifyObservers(componentId, operation, isLoading) {
    this.observers.forEach(callback => 
      callback(componentId, operation, isLoading)
    );
  }

  setLoading(componentId, operation, isLoading) {
    const key = `${componentId}_${operation}`;
    this.states.set(key, isLoading);
    this.notifyObservers(componentId, operation, isLoading);
  }

  isLoading(componentId, operation) {
    const key = `${componentId}_${operation}`;
    return this.states.get(key) || false;
  }
}

export const loadingManager = new LoadingStateManager(); 