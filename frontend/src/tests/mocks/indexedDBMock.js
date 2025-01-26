export class IndexedDBMock {
  constructor() {
    this.stores = new Map();
    this.databases = new Map();
  }

  clear() {
    this.stores.clear();
    this.databases.clear();
  }

  open(dbName, version) {
    const request = {
      result: {
        objectStoreNames: {
          contains: (name) => this.stores.has(name)
        },
        createObjectStore: (name) => {
          const store = new Map();
          this.stores.set(name, store);
          return {
            put: (value, key) => {
              store.set(key, value);
              return Promise.resolve();
            },
            get: (key) => Promise.resolve(store.get(key)),
            delete: (key) => {
              store.delete(key);
              return Promise.resolve();
            }
          };
        },
        transaction: (storeName, mode) => ({
          store: {
            put: (value, key) => {
              this.stores.get(storeName).set(key, value);
              return Promise.resolve();
            },
            get: (key) => Promise.resolve(this.stores.get(storeName).get(key))
          }
        })
      },
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null
    };

    setTimeout(() => {
      if (request.onupgradeneeded) request.onupgradeneeded({ target: request });
      if (request.onsuccess) request.onsuccess({ target: request });
    }, 0);

    return request;
  }
} 