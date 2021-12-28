import { openDB, deleteDB, IDBPTransaction, IDBPDatabase } from 'idb'
import { getIndexedDBDatabases } from '../helpers/browser.helper'
import { ILocalDbInit } from '../interfaces/localDb.model.interface'
import { IIndexedDBDatabase } from '../interfaces/browser.interface'

export class IndexedDb {
    static dbPrefix = 'polo-blanco-idb'
    static dbVersion = 'v1'
    static storeNames = [
        'categories'
    ]
    static indexes = {
        'categories': ['slug', 'name']
    }
    static stores = {}
    static localDatabases: Promise<IIndexedDBDatabase[]>
    static isSWNotReady = false
    static isFirstLoad = false
    static localDbPromise: Promise<IDBPDatabase<unknown>>
    static isOfflineFirst = false

    static getDbName(): string {
        return `${this.dbPrefix}-${this.dbVersion}`;
    }

    static async init(swState: boolean): Promise<ILocalDbInit> {
        this.localDatabases = getIndexedDBDatabases()
        this.isSWNotReady = swState;
        await this.clearPreviousDB();
        this.isFirstLoad = !(await this.dbExist(this.getDbName()));
        this.localDbPromise = this.openDatabase();
        this.isOfflineFirst = typeof (await this.localDbPromise) !== 'undefined';

        return {
            isOfflineFirst: this.isOfflineFirst,
            isFirstLoad: this.isFirstLoad
        };
    }

    static openDatabase() {
        const storeNames = this.storeNames;
        const stores = this.stores;
        const indexes = this.indexes;
        const getObjetcStore = this.getObjetcStore;

        return openDB(this.getDbName(), 1, {
            upgrade(upgradeDb, oldVersion, newVersion, transaction) {
                console.log('storeNames =', storeNames)
                storeNames
                    .forEach(store => stores[store] = getObjetcStore(transaction, store));

                switch (oldVersion) {
                    case 0:
                        stores['categories'] = upgradeDb.createObjectStore('categories', {
                            keyPath: 'id'
                        });
                        indexes['categories']
                            .forEach(index => stores['categories'].createIndex(`by-${index}`, `${index}`));
                }
            }
        })
    }

    static getObjetcStore(transaction: IDBPTransaction<unknown, string[], "versionchange">, storeName: string) {
        try {
            return transaction.objectStore(storeName);
        } catch (e) {
            return null;
        }
    }

    static async clearPreviousDB() {
        const localDatabases = await this.localDatabases;
        return localDatabases
            .filter(ldb => ldb.name.startsWith(this.dbPrefix) && ldb.name !== this.getDbName())
            .map(ldb => deleteDB(ldb.name));
    }

    static async dbExist(dbName: string) {
        const localDatabases = await this.localDatabases;
        return localDatabases
            .map(ldb => ldb.name).includes(dbName);
    }

    static async getInitialData(collectionName: string, /*filters: IDatabaseFilter[],*/ mode: 'single' | 'all') {
        const ldb = await this.localDbPromise;
        if (!ldb) return;
        // if (!filters.length) return;

        let query = ldb.transaction(collectionName).objectStore(collectionName);
        // if (filters[0].method.includes('-by')) query = query.index(`by-${filters[0].key}`);

        // if (mode === 'single') return [await query.get(filters[0].value)];
        if (mode === 'all') return query.getAll();
    }

    static async add(collectionName: string, doc: any) {
        const ldb = await this.localDbPromise;
        if (!ldb) return;
        const tx = ldb.transaction(collectionName, 'readwrite');
        const store = tx.objectStore(collectionName);
        store.put(doc);
        // return tx.complete;
        return tx.oncomplete;
    }
}