import { LocalStorageMock } from './mocks/localStorageMock';
import { IndexedDBMock } from './mocks/indexedDBMock';

// Setup mocks for browser APIs
global.localStorage = new LocalStorageMock();
global.indexedDB = new IndexedDBMock();

// Clear storage between tests
beforeEach(() => {
  localStorage.clear();
  indexedDB.clear();
}); 