const DB_NAME = 'StudyGeniCache';
const STORE_NAME = 'chatHistory';
const SUMMARY_STORE = 'summaries';
const EXPLANATION_STORE = 'explanations';
const DB_VERSION = 3; // Incremented version to 3

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            const transaction = (event.target as IDBOpenDBRequest).transaction;

            // Chat History Store
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'documentId' });
            }

            // Summaries Store
            if (!db.objectStoreNames.contains(SUMMARY_STORE)) {
                db.createObjectStore(SUMMARY_STORE, { keyPath: 'documentId' });
            }

            // Explanations Store
            let explanationStore: IDBObjectStore;
            if (!db.objectStoreNames.contains(EXPLANATION_STORE)) {
                explanationStore = db.createObjectStore(EXPLANATION_STORE, { keyPath: 'id' });
            } else {
                explanationStore = transaction!.objectStore(EXPLANATION_STORE);
            }

            // Create Index on documentId
            if (!explanationStore.indexNames.contains('by_documentId')) {
                explanationStore.createIndex('by_documentId', 'documentId', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

export const getCachedChatHistory = async (documentId: string): Promise<any> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(documentId);

        request.onsuccess = () => {
            resolve(request.result ? request.result.data : null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const cacheChatHistory = async (documentId: string, data: any) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ documentId, data, timestamp: Date.now() });

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

// --- Summary Cache ---

export const getCachedSummary = async (documentId: string): Promise<string | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(SUMMARY_STORE, 'readonly');
        const store = transaction.objectStore(SUMMARY_STORE);
        const request = store.get(documentId);

        request.onsuccess = () => {
            resolve(request.result ? request.result.summary : null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const cacheSummary = async (documentId: string, summary: string) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(SUMMARY_STORE, 'readwrite');
        const store = transaction.objectStore(SUMMARY_STORE);
        const request = store.put({ documentId, summary, timestamp: Date.now() });

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

// --- Explanation Cache ---

export const getCachedExplanation = async (documentId: string, concept: string): Promise<string | null> => {
    const db = await openDB();
    const id = `${documentId}:${concept.toLowerCase().trim()}`;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(EXPLANATION_STORE, 'readonly');
        const store = transaction.objectStore(EXPLANATION_STORE);
        const request = store.get(id);

        request.onsuccess = () => {
            resolve(request.result ? request.result.explanation : null);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const cacheExplanation = async (documentId: string, concept: string, explanation: string) => {
    const db = await openDB();
    const id = `${documentId}:${concept.toLowerCase().trim()}`;
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(EXPLANATION_STORE, 'readwrite');
        const store = transaction.objectStore(EXPLANATION_STORE);
        const request = store.put({ id, documentId, concept, explanation, timestamp: Date.now() });

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const getExplanationsByDocument = async (documentId: string): Promise<any[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(EXPLANATION_STORE, 'readonly');
        const store = transaction.objectStore(EXPLANATION_STORE);
        const index = store.index('by_documentId');
        const request = index.getAll(documentId);

        request.onsuccess = () => {
            const results = request.result || [];
            // Sort by timestamp descending
            results.sort((a, b) => b.timestamp - a.timestamp);
            resolve(results);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};
